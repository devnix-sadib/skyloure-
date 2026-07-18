import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = Router();

router.get('/', isAuthenticated, (req, res) => {
  const items = db.prepare(`
    SELECT favorites.id as fav_id, products.* FROM favorites
    JOIN products ON favorites.product_id = products.id
    WHERE favorites.user_id = ?
  `).all(req.user.id);
  res.json(items);
});

router.post('/', isAuthenticated, (req, res) => {
  const { product_id } = req.body;
  if (!product_id) return res.status(400).json({ error: 'product_id required' });
  const existing = db.prepare('SELECT * FROM favorites WHERE user_id = ? AND product_id = ?').get(req.user.id, product_id);
  if (existing) return res.json({ ok: true });
  const id = uuidv4();
  db.prepare('INSERT INTO favorites (id, user_id, product_id) VALUES (?, ?, ?)').run(id, req.user.id, product_id);
  res.json({ ok: true });
});

router.delete('/:product_id', isAuthenticated, (req, res) => {
  db.prepare('DELETE FROM favorites WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.product_id);
  res.json({ ok: true });
});

export default router;
