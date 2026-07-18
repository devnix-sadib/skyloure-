import db from './db.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

// Create admin user
const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@skyloure.com');
if (!existing) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)').run(
    uuidv4(), 'Admin', 'admin@skyloure.com', hashedPassword, 'admin'
  );
  console.log('Admin user created: admin@skyloure.com / admin123');
} else {
  const admin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@skyloure.com');
  if (!admin.password) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare('UPDATE users SET password = ?, google_id = NULL WHERE email = ?').run(hashedPassword, 'admin@skyloure.com');
    console.log('Admin password updated: admin@skyloure.com / admin123');
  }
}

// Create categories with images
const categoryData = [
  { name: 'Tote Bags', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80' },
  { name: 'Crossbody Bags', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80' },
  { name: 'Clutches', image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&q=80' },
  { name: 'Shoulder Bags', image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&q=80' },
  { name: 'Backpacks', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80' },
  { name: 'Wallets', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80' },
];
const catIds = {};
for (const { name, image } of categoryData) {
  const existingCat = db.prepare('SELECT id FROM categories WHERE name = ?').get(name);
  if (!existingCat) {
    const id = uuidv4();
    db.prepare('INSERT INTO categories (id, name, image) VALUES (?, ?, ?)').run(id, name, image);
    catIds[name] = id;
  } else {
    db.prepare('UPDATE categories SET image = ? WHERE id = ?').run(image, existingCat.id);
    catIds[name] = existingCat.id;
  }
}
console.log('Categories created with images.');

// Create products — price = regular/original price, offer_price = sale price
const products = [
  { cat: 'Tote Bags', name: 'Classic Leather Tote', description: 'Spacious genuine leather tote bag', price: 249.00, offer_price: 189.00, colors: 'Black,Brown,Tan', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80', images: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80,https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&q=80,https://images.unsplash.com/photo-1563903530908-afdd155d057a?w=600&q=80' },
  { cat: 'Tote Bags', name: 'Canvas Beach Tote', description: 'Lightweight canvas tote for everyday', price: 79.00, offer_price: null, colors: 'Beige,Navy,Red', image: 'https://images.unsplash.com/photo-1563903530908-afdd155d057a?w=600&q=80', images: 'https://images.unsplash.com/photo-1563903530908-afdd155d057a?w=600&q=80,https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80,https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&q=80' },
  { cat: 'Tote Bags', name: 'Structured Work Tote', description: 'Professional bag with laptop compartment', price: 299.00, offer_price: 249.00, colors: 'Black,Navy,Charcoal', image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&q=80', images: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&q=80,https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80,https://images.unsplash.com/photo-1563903530908-afdd155d057a?w=600&q=80' },
  { cat: 'Crossbody Bags', name: 'Mini Crossbody', description: 'Compact crossbody with adjustable strap', price: 129.00, offer_price: null, colors: 'Black,Brown,Pink', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', images: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80,https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80,https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80' },
  { cat: 'Crossbody Bags', name: 'Quilted Crossbody', description: 'Elegant quilted design with gold hardware', price: 199.00, offer_price: 129.00, colors: 'Black,Navy,Red,Blush', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80', images: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80,https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80,https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80' },
  { cat: 'Crossbody Bags', name: 'Phone Crossbody', description: 'Slim bag for essentials', price: 89.00, offer_price: null, colors: 'Black,Brown,Beige', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80', images: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80,https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80,https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80' },
  { cat: 'Clutches', name: 'Evening Clutch', description: 'Satin clutch with crystal embellishment', price: 259.00, offer_price: 199.00, colors: 'Black,Gold,Silver', image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80', images: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80,https://images.unsplash.com/photo-1559563458-527698bf5295?w=600&q=80,https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80' },
  { cat: 'Clutches', name: 'Envelope Clutch', description: 'Minimalist leather envelope clutch', price: 149.00, offer_price: null, colors: 'Black,Nude,Red', image: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=600&q=80', images: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=600&q=80,https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80,https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80' },
  { cat: 'Clutches', name: 'Box Clutch', description: 'Hard-shell structured clutch', price: 229.00, offer_price: 149.00, colors: 'Black,Gold,Blush', image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80', images: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80,https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80,https://images.unsplash.com/photo-1559563458-527698bf5295?w=600&q=80' },
  { cat: 'Shoulder Bags', name: 'Classic Shoulder Bag', description: 'Timeless shoulder bag design', price: 219.00, offer_price: null, colors: 'Black,Brown,Camel', image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80', images: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80,https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80,https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&q=80' },
  { cat: 'Shoulder Bags', name: 'Chain Shoulder Bag', description: 'Elegant chain strap shoulder bag', price: 249.00, offer_price: 199.00, colors: 'Black,Gold,Silver', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80', images: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80,https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80,https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&q=80' },
  { cat: 'Shoulder Bags', name: 'Hobo Shoulder Bag', description: 'Slouchy crescent-shaped hobo bag', price: 169.00, offer_price: null, colors: 'Brown,Tan,Camel', image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&q=80', images: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&q=80,https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80,https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80' },
  { cat: 'Backpacks', name: 'Leather Backpack', description: 'Full-grain leather backpack', price: 329.00, offer_price: 279.00, colors: 'Black,Brown,Navy', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80', images: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80,https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=80,https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80' },
  { cat: 'Backpacks', name: 'Mini Backpack', description: 'Compact backpack for casual days', price: 139.00, offer_price: null, colors: 'Black,Pink,Beige', image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=80', images: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=80,https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80,https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80' },
  { cat: 'Wallets', name: 'Bi-fold Wallet', description: 'Classic bi-fold leather wallet', price: 119.00, offer_price: 89.00, colors: 'Black,Brown,Navy', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80', images: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80,https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80,https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80' },
  { cat: 'Wallets', name: 'Card Holder', description: 'Slim card case with RFID protection', price: 59.00, offer_price: null, colors: 'Black,Brown,Red', image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80', images: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80,https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80,https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80' },
  { cat: 'Wallets', name: 'Zip Around Wallet', description: 'Secure zip-around wallet with coin pocket', price: 139.00, offer_price: 89.00, colors: 'Black,Navy,Red', image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80', images: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80,https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80,https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80' },
];

for (const p of products) {
  const existingP = db.prepare('SELECT id FROM products WHERE name = ?').get(p.name);
  if (!existingP && catIds[p.cat]) {
    db.prepare('INSERT INTO products (id, category_id, name, description, price, offer_price, image, images, stock_status, colors) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)').run(
      uuidv4(), catIds[p.cat], p.name, p.description, p.price, p.offer_price, p.image, p.images, p.colors || ''
    );
  } else if (existingP && catIds[p.cat]) {
    db.prepare('UPDATE products SET image = ?, images = ?, price = ?, offer_price = ?, stock_status = 1, colors = ? WHERE id = ?').run(p.image, p.images, p.price, p.offer_price, p.colors || '', existingP.id);
  }
}
console.log('Products created with images, prices, and colors.');
console.log('Seed completed!');
