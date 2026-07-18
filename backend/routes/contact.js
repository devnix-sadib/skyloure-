import { Router } from 'express';
import db from '../db.js';
import { isAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  const info = db.prepare('SELECT * FROM contact_info WHERE id = 1').get();
  res.json(info);
});

router.put('/', isAdmin, (req, res) => {
  const { email, phone, address, instagram, facebook, whatsapp } = req.body;
  db.prepare('UPDATE contact_info SET email = ?, phone = ?, address = ?, instagram = ?, facebook = ?, whatsapp = ? WHERE id = 1').run(
    email || null, phone || null, address || null, instagram || null, facebook || null, whatsapp || null
  );
  res.json({ ok: true });
});

export default router;
