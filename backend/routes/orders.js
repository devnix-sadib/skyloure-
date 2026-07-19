import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db, { beginTransaction, commitTransaction, rollbackTransaction } from '../db.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import { sendOrderConfirmation } from '../email.js';

const router = Router();

function getShippingFee() {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'shipping_fee'").get();
  return row ? parseFloat(row.value) || 120 : 120;
}

router.get('/', isAuthenticated, (req, res) => {
  let orders;
  if (req.user.role === 'admin') {
    orders = db.prepare(`
      SELECT o.*, u.name as user_name, u.email as user_email FROM orders o
      JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC
    `).all();
  } else {
    orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  }
  res.json(orders);
});

router.get('/:id', isAuthenticated, (req, res) => {
  const order = db.prepare('SELECT o.*, u.name as user_name, u.email as user_email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  if (req.user.role !== 'admin' && order.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(req.params.id);
  res.json({ ...order, items });
});

router.post('/', isAuthenticated, (req, res) => {
  const { buyer_name, mobile, address, phone, notes } = req.body;
  if (!buyer_name || !mobile || !address) return res.status(400).json({ error: 'Name, mobile, and address required' });
  const cartItems = db.prepare(`
    SELECT cart.quantity, cart.color, products.* FROM cart
    JOIN products ON cart.product_id = products.id
    WHERE cart.user_id = ?
  `).all(req.user.id);

  if (cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });

  const shippingFee = getShippingFee();
  const getPrice = (item) => (item.offer_price && item.offer_price > 0 && item.offer_price < item.price ? item.offer_price : item.price);
  const subtotal = cartItems.reduce((sum, item) => sum + getPrice(item) * item.quantity, 0);
  const total = subtotal + (cartItems.length > 0 ? shippingFee : 0);
  const orderId = uuidv4();

  const insertOrder = db.prepare('INSERT INTO orders (id, user_id, total, shipping_fee, status, buyer_name, mobile, address, phone, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const insertItem = db.prepare('INSERT INTO order_items (id, order_id, product_id, product_name, price, quantity, image, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const clearCart = db.prepare('DELETE FROM cart WHERE user_id = ?');

  beginTransaction();
  try {
    insertOrder.run(orderId, req.user.id, total, shippingFee, 'pending', buyer_name, mobile, address, phone || mobile, notes || null);
    for (const item of cartItems) {
      insertItem.run(uuidv4(), orderId, item.id, item.name, getPrice(item), item.quantity, item.image, item.color || '');
    }
    clearCart.run(req.user.id);
    commitTransaction();
  } catch (e) {
    rollbackTransaction();
    throw e;
  }

  sendOrderConfirmation({
    to: req.user.email,
    name: buyer_name,
    orderId,
    total,
    subtotal,
    shippingFee,
    items: cartItems.map(i => ({ product_name: i.name, price: getPrice(i), quantity: i.quantity })),
  });

  res.json({ id: orderId, total, shipping_fee: shippingFee, status: 'pending' });
});

router.delete('/:id', isAdmin, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  if (order.status === 'completed') {
    return res.status(400).json({ error: 'Cannot delete completed orders' });
  }
  db.prepare('DELETE FROM order_items WHERE order_id = ?').run(req.params.id);
  db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.put('/:id/status', isAdmin, (req, res) => {
  const { status } = req.body;
  if (!['pending', 'shipped', 'delivered', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  if (order.status === 'completed' || order.status === 'cancelled') {
    return res.status(400).json({ error: 'Cannot change status of completed or cancelled orders' });
  }
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ ok: true });
});

export default router;
