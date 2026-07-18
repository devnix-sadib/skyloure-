import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

const router = Router();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
  callbackURL: '/api/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
  const existing = db.prepare('SELECT * FROM users WHERE google_id = ?').get(profile.id);
  if (existing) return done(null, existing);

  const email = profile.emails?.[0]?.value;
  const emailExisting = email ? db.prepare('SELECT * FROM users WHERE email = ?').get(email) : null;
  if (emailExisting) {
    db.prepare('UPDATE users SET google_id = ?, avatar = ? WHERE id = ?').run(profile.id, profile.photos?.[0]?.value, emailExisting.id);
    return done(null, { ...emailExisting, google_id: profile.id, avatar: profile.photos?.[0]?.value });
  }

  const id = uuidv4();
  db.prepare('INSERT INTO users (id, google_id, name, email, avatar) VALUES (?, ?, ?, ?, ?)').run(
    id, profile.id, profile.displayName, email, profile.photos?.[0]?.value
  );
  const user = db.prepare('SELECT id, google_id, name, email, avatar, role FROM users WHERE id = ?').get(id);
  done(null, user);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = db.prepare('SELECT id, name, email, avatar, role, created_at FROM users WHERE id = ?').get(id);
  done(null, user);
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', {
  successRedirect: '/api/auth/success',
  failureRedirect: '/api/auth/failure',
}));

router.get('/success', (req, res) => {
  res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
});

router.get('/failure', (req, res) => {
  res.redirect((process.env.FRONTEND_URL || 'http://localhost:5173') + '/login?error=true');
});

router.get('/me', (req, res) => {
  if (req.isAuthenticated()) return res.json(req.user);
  res.json(null);
});

router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.json({ ok: true });
  });
});

export default router;
