import { Router } from 'express';
import db from '../db.js';
import { isAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = {};
  for (const row of rows) settings[row.key] = row.value;
  res.json(settings);
});

router.put('/:key', isAdmin, (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  if (!['shipping_fee'].includes(key)) return res.status(400).json({ error: 'Invalid setting key' });
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, String(value));
  res.json({ ok: true });
});

export default router;
