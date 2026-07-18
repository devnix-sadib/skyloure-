import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/', isAuthenticated, (req, res) => {
  const items = db.prepare(`
    SELECT cart.id AS _cart_id, cart.quantity, cart.color, products.* FROM cart
    JOIN products ON cart.product_id = products.id
    WHERE cart.user_id = ?
  `).all(req.user.id);
  res.json(items);
});

router.post('/', isAuthenticated, (req, res) => {
  const { product_id, quantity, color } = req.body;
  if (!product_id) return res.status(400).json({ error: 'product_id required' });
  const existing = db.prepare('SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND color = ?').get(req.user.id, product_id, color || '');
  if (existing) {
    db.prepare('UPDATE cart SET quantity = quantity + ? WHERE id = ?').run(quantity || 1, existing.id);
    return res.json({ ok: true });
  }
  const id = uuidv4();
  db.prepare('INSERT INTO cart (id, user_id, product_id, quantity, color) VALUES (?, ?, ?, ?, ?)').run(id, req.user.id, product_id, quantity || 1, color || '');
  res.json({ ok: true });
});

router.put('/:id', isAuthenticated, (req, res) => {
  const { quantity } = req.body;
  const item = db.prepare('SELECT * FROM cart WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  if (quantity <= 0) {
    db.prepare('DELETE FROM cart WHERE id = ?').run(req.params.id);
    return res.json({ ok: true });
  }
  db.prepare('UPDATE cart SET quantity = ? WHERE id = ?').run(quantity, req.params.id);
  res.json({ ok: true });
});

router.delete('/:id', isAuthenticated, (req, res) => {
  db.prepare('DELETE FROM cart WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

router.delete('/', isAuthenticated, (req, res) => {
  db.prepare('DELETE FROM cart WHERE user_id = ?').run(req.user.id);
  res.json({ ok: true });
});

export default router;
