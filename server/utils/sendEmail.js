import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

let _transporter = null
const getTransporter = () => {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }
  return _transporter
}

/**
 * Send an email
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    await getTransporter().sendMail({
      from: `"FALLEN Watches" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })
    console.log(`📧 Email sent to: ${to}`)
  } catch (error) {
    console.error('📧 Email failed:', error.message)
    // Don't throw — email failure shouldn't break the order flow
  }
}

/**
 * Build a premium order confirmation email
 */
export const buildOrderEmail = (order, customerName) => {
  const itemsHtml = order.orderItems.map(item => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;vertical-align:middle;margin-right:10px;" />` : ''}
        ${item.name}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>
  `).join('')

  const addr = order.shippingAddress || {}
  const addressHtml = `${addr.fullName || ''}<br>${addr.addressLine1 || ''}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}<br>${addr.city || ''}, ${addr.state || ''} ${addr.pincode || ''}<br>📞 ${addr.phone || ''}`

  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f5f5f5;">
    <div style="max-width:600px;margin:0 auto;background:#fff;">
      
      <!-- Header -->
      <div style="background:#111118;padding:28px 30px;text-align:center;">
        <img src="https://res.cloudinary.com/dhfvktqon/image/upload/v1774103946/fallen_f_logo_1774103490210_befmeq.jpg" alt="FALLEN" style="width:60px;height:60px;border-radius:50%;margin-bottom:8px;" />
        <h1 style="margin:0;color:#c9a84c;font-size:24px;letter-spacing:4px;">FALLEN</h1>
        <p style="margin:4px 0 0;color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:2px;">WATCHES</p>
      </div>

      <!-- Order Banner -->
      <div style="background:linear-gradient(135deg,#c9a84c,#b8941f);padding:20px 30px;text-align:center;">
        <h2 style="margin:0;color:#fff;font-size:18px;">🎉 New Order Placed!</h2>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
          Tracking ID: <strong>${order.trackingId || 'Generating...'}</strong>
        </p>
      </div>

      <div style="padding:30px;">
        <!-- Customer Info -->
        <div style="margin-bottom:24px;">
          <h3 style="margin:0 0 8px;color:#111;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Customer</h3>
          <p style="margin:0;color:#555;font-size:14px;">${customerName}</p>
        </div>

        <!-- Items Table -->
        <h3 style="margin:0 0 12px;color:#111;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Order Items</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px;">
          <thead>
            <tr style="background:#fafafa;">
              <th style="padding:10px 12px;text-align:left;color:#888;font-size:11px;text-transform:uppercase;">Product</th>
              <th style="padding:10px 12px;text-align:center;color:#888;font-size:11px;text-transform:uppercase;">Qty</th>
              <th style="padding:10px 12px;text-align:right;color:#888;font-size:11px;text-transform:uppercase;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Totals -->
        <div style="background:#fafafa;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
          <table style="width:100%;font-size:13px;">
            <tr>
              <td style="color:#666;padding:3px 0;">Subtotal</td>
              <td style="color:#666;padding:3px 0;text-align:right;">₹${order.itemsTotal?.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td style="color:#666;padding:3px 0;">Shipping</td>
              <td style="color:#666;padding:3px 0;text-align:right;">${order.shippingCharge === 0 ? 'Free' : '₹' + order.shippingCharge}</td>
            </tr>
            ${order.discount > 0 ? `
            <tr>
              <td style="color:#27ae60;padding:3px 0;">Discount</td>
              <td style="color:#27ae60;padding:3px 0;text-align:right;">-₹${order.discount?.toLocaleString('en-IN')}</td>
            </tr>` : ''}
            <tr>
              <td style="padding:10px 0 3px;border-top:1px solid #e0e0e0;font-size:16px;font-weight:700;color:#111;">Total</td>
              <td style="padding:10px 0 3px;border-top:1px solid #e0e0e0;font-size:16px;font-weight:700;color:#111;text-align:right;">₹${order.totalAmount?.toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </div>

        <!-- Payment Info -->
        <div style="margin-bottom:24px;">
          <h3 style="margin:0 0 8px;color:#111;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Payment</h3>
          <p style="margin:0;font-size:13px;color:#555;">
            Status: <span style="color:#27ae60;font-weight:600;">✅ PAID</span><br>
            Method: Razorpay<br>
            Payment ID: ${order.paymentInfo?.razorpayPaymentId || 'N/A'}
          </p>
        </div>

        <!-- Shipping Address -->
        <div style="margin-bottom:24px;">
          <h3 style="margin:0 0 8px;color:#111;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Shipping Address</h3>
          <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">${addressHtml}</p>
        </div>

        <!-- Order Date -->
        <p style="font-size:12px;color:#999;text-align:center;margin-top:30px;">
          Order placed on ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#111118;padding:20px;text-align:center;">
        <p style="margin:0;color:rgba(255,255,255,0.35);font-size:11px;">
          FALLEN Watches — Premium Timepieces
        </p>
      </div>
    </div>
  </body>
  </html>
  `
}

export default sendEmail
