import Razorpay from 'razorpay'
import crypto from 'crypto'
import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import Coupon from '../models/Coupon.js'
import User from '../models/User.js'
import sendEmail, { buildOrderEmail } from '../utils/sendEmail.js'

let _razorpay = null
const getRazorpay = () => {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }
  return _razorpay
}

// POST /api/orders — create order + Razorpay order
export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, couponCode, cartItems } = req.body

    // cartItems come from frontend localStorage cart
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' })
    }

    // Build order items and calc total
    const orderItems = []
    let itemsTotal = 0

    for (const item of cartItems) {
      const itemId = item.id || item._id
      let product = null

      // Only look up in DB if it's a valid MongoDB ObjectId
      if (itemId && /^[0-9a-fA-F]{24}$/.test(String(itemId))) {
        product = await Product.findById(itemId)
      }

      if (!product) {
        // Static/local data — use prices from frontend
        orderItems.push({
          product: null,
          name: item.name,
          image: item.image || '',
          price: item.salePrice,
          quantity: item.quantity,
        })
        itemsTotal += item.salePrice * item.quantity
        continue
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} only has ${product.stock} in stock`,
        })
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0]?.url || item.image || '',
        price: product.salePrice,
        quantity: item.quantity,
      })

      itemsTotal += product.salePrice * item.quantity
    }

    // Shipping: free above ₹5000
    const shippingCharge = itemsTotal >= 5000 ? 0 : 99

    // Apply coupon
    let discount = 0
    let couponApplied = ''
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() })
      if (coupon && coupon.isValid()) {
        discount = coupon.calcDiscount(itemsTotal)
        couponApplied = coupon.code
        coupon.usedCount += 1
        await coupon.save()
      }
    }

    const totalAmount = itemsTotal + shippingCharge - discount

    // Create Razorpay order
    const razorpayOrder = await getRazorpay().orders.create({
      amount: Math.round(totalAmount * 100), // paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    })

    // Create DB order
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentInfo: {
        razorpayOrderId: razorpayOrder.id,
        status: 'pending',
      },
      itemsTotal,
      shippingCharge,
      discount,
      totalAmount,
      couponApplied,
    })

    res.status(201).json({
      order,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
    })
  } catch (error) {
    next(error)
  }
}

// POST /api/orders/verify — verify Razorpay payment
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed' })
    }

    // Update order
    const order = await Order.findOne({ 'paymentInfo.razorpayOrderId': razorpayOrderId })
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    order.paymentInfo.razorpayPaymentId = razorpayPaymentId
    order.paymentInfo.razorpaySignature = razorpaySignature
    order.paymentInfo.status = 'paid'
    order.paymentInfo.method = 'razorpay'

    // Generate tracking ID
    order.trackingId = 'FLN' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase()

    await order.save()

    // Reduce stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      })
    }

    // Clear cart
    await Cart.findOneAndDelete({ user: order.user })

    // Respond immediately — don't make user wait for emails
    res.json({ message: 'Payment verified', order })

    // Send order confirmation emails in background (fire-and-forget)
    ;(async () => {
      try {
        const customer = await User.findById(order.user)
        const customerName = customer ? `${customer.firstName} ${customer.lastName}` : order.shippingAddress.fullName
        const emailHtml = buildOrderEmail(order, customerName)

        if (process.env.ADMIN_EMAIL) {
          sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: `🛒 New Order #${order.trackingId} — ₹${order.totalAmount?.toLocaleString('en-IN')}`,
            html: emailHtml,
          })
        }

        if (customer?.email) {
          sendEmail({
            to: customer.email,
            subject: `Your FALLEN order is confirmed! #${order.trackingId}`,
            html: emailHtml,
          })
        }
      } catch (emailErr) {
        console.error('Email error (non-blocking):', emailErr.message)
      }
    })()
  } catch (error) {
    next(error)
  }
}

// GET /api/orders/my — user's order history
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('orderItems.product', 'name images')

    res.json(orders)
  } catch (error) {
    next(error)
  }
}

// GET /api/orders/:id — single order
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('orderItems.product', 'name images')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Only the order owner or admin can view
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }

    res.json(order)
  } catch (error) {
    next(error)
  }
}

// GET /api/orders/track/:trackingId — public track
export const trackOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ trackingId: req.params.trackingId })
      .select('orderStatus trackingId shippingAddress createdAt deliveredAt orderItems.name orderItems.quantity')

    if (!order) {
      return res.status(404).json({ message: 'No order found with this tracking ID' })
    }

    res.json(order)
  } catch (error) {
    next(error)
  }
}

// PUT /api/orders/:id/status — Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    order.orderStatus = req.body.status

    if (req.body.status === 'delivered') {
      order.deliveredAt = new Date()
    }

    await order.save()
    res.json(order)
  } catch (error) {
    next(error)
  }
}

// GET /api/orders — Admin: all orders
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const filter = {}
    if (status) filter.orderStatus = status

    const skip = (Number(page) - 1) * Number(limit)
    const total = await Order.countDocuments(filter)
    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    res.json({ orders, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) })
  } catch (error) {
    next(error)
  }
}

// PUT /api/orders/:id/cancel — user cancels unpaid order
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Only the owner can cancel
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    // Only cancel unpaid orders
    if (order.paymentInfo.status === 'paid') {
      return res.status(400).json({ message: 'Cannot cancel a paid order' })
    }

    order.orderStatus = 'cancelled'
    await order.save()

    res.json({ message: 'Order cancelled' })
  } catch (error) {
    next(error)
  }
}
