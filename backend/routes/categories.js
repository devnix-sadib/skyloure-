import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { isAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY created_at DESC').all();
  res.json(categories);
});

router.get('/:id', (req, res) => {
  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Not found' });
  res.json(cat);
});

router.post('/', isAdmin, (req, res) => {
  const { name, image } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const id = uuidv4();
  db.prepare('INSERT INTO categories (id, name, image) VALUES (?, ?, ?)').run(id, name, image || null);
  res.json({ id, name, image: image || null });
});

router.put('/:id', isAdmin, (req, res) => {
  const { name, image } = req.body;
  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE categories SET name = ?, image = ? WHERE id = ?').run(
    name || cat.name, image !== undefined ? image : cat.image, req.params.id
  );
  res.json({ ok: true });
});

router.delete('/:id', isAdmin, (req, res) => {
  db.prepare('DELETE FROM products WHERE category_id = ?').run(req.params.id);
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
