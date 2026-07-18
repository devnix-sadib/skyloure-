import { Router } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)').run(
      id, name, email, hashedPassword, 'user'
    );
    const user = db.prepare('SELECT id, name, email, avatar, role FROM users WHERE id = ?').get(id);

    req.login(user, err => {
      if (err) return res.status(500).json({ error: 'Login failed' });
      res.json(user);
    });
  } catch (e) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    if (!user.password) return res.status(401).json({ error: 'This account uses Google login. Please sign in with Google.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const { password: _, ...safeUser } = user;

    req.login(safeUser, err => {
      if (err) return res.status(500).json({ error: 'Login failed' });
      res.json(safeUser);
    });
  } catch (e) {
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
