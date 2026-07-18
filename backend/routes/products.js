import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { isAdmin } from '../middleware/auth.js';

function parseProduct(p) {
  if (!p) return null;
  return { ...p, images: p.images ? p.images.split(',').filter(Boolean) : (p.image ? [p.image] : []) };
}

const router = Router();

router.get('/', (req, res) => {
  const { category_id } = req.query;
  let products;
  if (category_id) {
    products = db.prepare('SELECT * FROM products WHERE category_id = ? ORDER BY created_at DESC').all(category_id);
  } else {
    products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  }
  res.json(products.map(parseProduct));
});

router.get('/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(parseProduct(p));
});

router.post('/', isAdmin, (req, res) => {
  const { category_id, name, description, price, regular_price, offer_price, image, images, stock_status, colors } = req.body;
  if (!category_id || !name || !price) return res.status(400).json({ error: 'category_id, name, price required' });
  const cat = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
  if (!cat) return res.status(400).json({ error: 'Invalid category' });
  const id = uuidv4();
  const imagesStr = images ? (Array.isArray(images) ? images.join(',') : images) : (image || '');
  const mainImage = image || (Array.isArray(images) ? images[0] : '') || '';
  db.prepare('INSERT INTO products (id, category_id, name, description, price, regular_price, offer_price, image, images, stock_status, colors) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    id, category_id, name, description || '', parseFloat(price), regular_price ? parseFloat(regular_price) : null, offer_price ? parseFloat(offer_price) : null,
    mainImage, imagesStr, stock_status !== undefined ? (stock_status ? 1 : 0) : 1, colors || ''
  );
  res.json({ ...parseProduct({ id, category_id, name, description: description || '', price: parseFloat(price), regular_price: regular_price ? parseFloat(regular_price) : null, offer_price: offer_price ? parseFloat(offer_price) : null, image: mainImage, images: imagesStr, stock_status: stock_status !== undefined ? (stock_status ? 1 : 0) : 1, colors: colors || '' }), ok: true });
});

router.put('/:id', isAdmin, (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const { category_id, name, description, price, regular_price, offer_price, image, images, stock_status, colors } = req.body;
  const imagesStr = images !== undefined ? (Array.isArray(images) ? images.join(',') : images) : p.images;
  const mainImage = image !== undefined ? image : (images !== undefined ? (Array.isArray(images) ? images[0] : images.split(',')[0]) : p.image);
  db.prepare('UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, regular_price = ?, offer_price = ?, image = ?, images = ?, stock_status = ?, colors = ? WHERE id = ?').run(
    category_id || p.category_id,
    name || p.name,
    description !== undefined ? description : p.description,
    price !== undefined ? parseFloat(price) : p.price,
    regular_price !== undefined ? (regular_price ? parseFloat(regular_price) : null) : p.regular_price,
    offer_price !== undefined ? (offer_price ? parseFloat(offer_price) : null) : p.offer_price,
    mainImage || null,
    imagesStr || '',
    stock_status !== undefined ? (stock_status ? 1 : 0) : p.stock_status,
    colors !== undefined ? colors : p.colors,
    req.params.id
  );
  res.json({ ok: true });
});

router.delete('/:id', isAdmin, (req, res) => {
  db.prepare('DELETE FROM cart WHERE product_id = ?').run(req.params.id);
  db.prepare('DELETE FROM favorites WHERE product_id = ?').run(req.params.id);
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
