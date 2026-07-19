import nodemailer from 'nodemailer';

function getTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendOrderConfirmation({ to, name, orderId, total, subtotal, shippingFee, items }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`Email not sent — SMTP not configured. Would send to ${to} for order #${orderId.slice(0, 8)}`);
    return;
  }

  const itemList = items.map(i =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;">${i.product_name} × ${i.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">৳${(i.price * i.quantity).toFixed(2)}</td></tr>`
  ).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="text-align:center;padding:30px 0;border-bottom:2px solid #e11d48;">
        <h1 style="color:#e11d48;margin:0;font-size:24px;">Skyloure</h1>
        <p style="color:#6b7280;margin:4px 0 0;">Premium Bags & Purses</p>
      </div>
      <div style="padding:24px 0;">
        <h2 style="color:#111827;font-size:20px;margin:0 0 8px;">Order Confirmed!</h2>
        <p style="color:#6b7280;margin:0 0 4px;">Hi <strong>${name}</strong>,</p>
        <p style="color:#6b7280;margin:0 0 20px;">Your order has been placed successfully. Here are the details:</p>
        <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:20px;">
          <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Order ID</p>
          <p style="margin:0 0 12px;font-weight:bold;color:#111827;font-size:15px;">#${orderId.slice(0, 8)}</p>
          <table style="width:100%;border-collapse:collapse;">${itemList}</table>
          <div style="border-top:1px solid #e5e7eb;margin-top:12px;padding-top:12px;">
            <table style="width:100%;font-size:14px;">
              <tr><td style="color:#6b7280;">Subtotal</td><td style="text-align:right;color:#111827;">৳${subtotal.toFixed(2)}</td></tr>
              <tr><td style="color:#6b7280;">Delivery Fee</td><td style="text-align:right;color:#111827;">৳${shippingFee}.00</td></tr>
              <tr><td style="color:#6b7280;padding-top:8px;font-size:16px;font-weight:bold;">Total</td><td style="text-align:right;padding-top:8px;font-size:16px;font-weight:bold;color:#e11d48;">৳${total.toFixed(2)}</td></tr>
            </table>
          </div>
        </div>
        <p style="color:#6b7280;font-size:13px;">We will notify you when your order is shipped. If you have any questions, contact us.</p>
      </div>
      <div style="border-top:1px solid #e5e7eb;padding:16px 0;text-align:center;font-size:12px;color:#9ca3af;">
        <p style="margin:0;">&copy; 2026 Skyloure. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@skyloure.com',
      to,
      subject: `Order Confirmed - #${orderId.slice(0, 8)}`,
      html,
    });
    console.log(`Order confirmation email sent to ${to}`);
  } catch (err) {
    console.error('Failed to send email:', err.message);
  }
}
