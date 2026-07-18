import { DatabaseSync } from 'node:sqlite';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(join(__dirname, 'skyloure.db'));
db.exec('PRAGMA foreign_keys = OFF');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    google_id TEXT UNIQUE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    avatar TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    regular_price REAL,
    offer_price REAL,
    image TEXT,
    stock_status INTEGER DEFAULT 1,
    colors TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS cart (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    color TEXT DEFAULT '',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    buyer_name TEXT DEFAULT '',
    mobile TEXT DEFAULT '',
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    image TEXT DEFAULT '',
    color TEXT DEFAULT '',
    FOREIGN KEY (order_id) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS contact_info (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    email TEXT,
    phone TEXT,
    address TEXT,
    instagram TEXT,
    facebook TEXT,
    whatsapp TEXT
  );
`);

// Add new columns for existing databases
try { db.exec('ALTER TABLE products ADD COLUMN regular_price REAL'); } catch (e) {}
try { db.exec('ALTER TABLE products ADD COLUMN offer_price REAL'); } catch (e) {}
try { db.exec('ALTER TABLE products ADD COLUMN stock_status INTEGER DEFAULT 1'); } catch (e) {}
try { db.exec('ALTER TABLE products ADD COLUMN colors TEXT DEFAULT ""'); } catch (e) {}
try { db.exec('ALTER TABLE cart ADD COLUMN color TEXT DEFAULT ""'); } catch (e) {}
try { db.exec('ALTER TABLE order_items ADD COLUMN image TEXT DEFAULT ""'); } catch (e) {}
try { db.exec('ALTER TABLE order_items ADD COLUMN color TEXT DEFAULT ""'); } catch (e) {}
try { db.exec('ALTER TABLE orders ADD COLUMN buyer_name TEXT DEFAULT ""'); } catch (e) {}
try { db.exec('ALTER TABLE orders ADD COLUMN mobile TEXT DEFAULT ""'); } catch (e) {}
try { db.exec('ALTER TABLE products ADD COLUMN images TEXT DEFAULT ""'); } catch (e) {}

const row = db.prepare('SELECT id FROM contact_info WHERE id = 1').get();
if (!row) {
  db.prepare('INSERT INTO contact_info (id, email, phone, address) VALUES (1, ?, ?, ?)').run(
    'contact@skyloure.com', '+1 234 567 890', '123 Fashion Street, NY'
  );
}

export function beginTransaction() { db.exec('BEGIN'); }
export function commitTransaction() { db.exec('COMMIT'); }
export function rollbackTransaction() { db.exec('ROLLBACK'); }

export default db;
