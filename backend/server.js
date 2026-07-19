import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import authRouter from './routes/auth.js';
import localAuthRouter from './routes/local-auth.js';
import uploadRouter from './routes/upload.js';
import categoriesRouter from './routes/categories.js';
import productsRouter from './routes/products.js';
import cartRouter from './routes/cart.js';
import favoritesRouter from './routes/favorites.js';
import ordersRouter from './routes/orders.js';
import contactRouter from './routes/contact.js';
import settingsRouter from './routes/settings.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'skyloure-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  },
}));
app.use(passport.initialize());
app.use(passport.session());

const uploadsPath = join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
app.use('/uploads', express.static(uploadsPath));

app.use('/api/auth', authRouter);
app.use('/api/auth', localAuthRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/contact', contactRouter);
app.use('/api/settings', settingsRouter);

app.get('/api/admin/check', (req, res) => {
  if (req.isAuthenticated() && req.user.role === 'admin') return res.json({ admin: true });
  res.json({ admin: false });
});

const frontendDist = join(__dirname, '..', 'frontend', 'dist');
console.log('Serving static files from:', frontendDist);
if (!fs.existsSync(frontendDist)) {
  console.error('ERROR: Frontend dist not found at', frontendDist);
}
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  const indexPath = join(frontendDist, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return res.status(500).send('Frontend not built. Run: npm run build');
  }
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`Skyloure running on http://localhost:${PORT}`);
});
