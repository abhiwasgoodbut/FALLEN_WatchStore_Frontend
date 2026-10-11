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

    // Shipping: free above ₹499
    const shippingCharge = itemsTotal >= 499 ? 0 : 99

    // Payment method & COD handling
    const isCod = req.body.paymentMethod === 'cod'
    const codFee = isCod ? 11 : 0

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

    const totalAmount = itemsTotal + shippingCharge + codFee - discount

    // If COD, create order directly without opening Razorpay
    if (isCod) {
      const trackingId = 'TRK' + Date.now().toString().slice(-8)
      const order = await Order.create({
        user: req.user._id,
        orderItems,
        shippingAddress,
        paymentInfo: {
          method: 'cod',
          status: 'pending',
        },
        itemsTotal,
        shippingCharge: shippingCharge + codFee,
        discount,
        totalAmount,
        couponApplied,
        trackingId,
      })

      // Send confirmation email
      try {
        const fullUser = await User.findById(req.user._id)
        if (fullUser?.email) {
          await sendEmail({
            to: fullUser.email,
            subject: `Order Placed (Cash on Delivery) — ${trackingId}`,
            html: buildOrderEmail(order, fullUser),
          })
        }
      } catch (emailErr) {
        // Continue even if email fails
      }

      return res.status(201).json({
        isCod: true,
        order,
      })
    }

    // Otherwise create Razorpay order for online payment
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
        method: 'online',
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
    const rawId = req.params.trackingId?.trim()
    // Support tracking by trackingId, awbNumber, or Mongo _id
    const query = {
      $or: [
        { trackingId: rawId },
        { awbNumber: rawId },
        { dropdashOrderId: rawId },
      ]
    }
    // If it's a valid ObjectId, also check _id
    if (rawId && rawId.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: rawId })
    }

    const order = await Order.findOne(query)
      .select('orderStatus trackingId awbNumber courierPartner dropdashOrderId estimatedDeliveryDate trackingHistory shippingAddress createdAt deliveredAt orderItems totalAmount paymentInfo itemsTotal shippingCharge discount')

    if (!order) {
      return res.status(404).json({ message: 'No shipment found with this Tracking ID or AWB.' })
    }

    res.json(order)
  } catch (error) {
    next(error)
  }
}

// PUT /api/orders/:id/status — Admin update status & Dropdash logistics
export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const { status, awbNumber, courierPartner, dropdashOrderId, trackingNote, location } = req.body

    if (status) {
      order.orderStatus = status
    }
    if (awbNumber !== undefined) {
      order.awbNumber = awbNumber
    }
    if (courierPartner !== undefined) {
      order.courierPartner = courierPartner
    }
    if (dropdashOrderId !== undefined) {
      order.dropdashOrderId = dropdashOrderId
    }

    if (status === 'delivered') {
      order.deliveredAt = new Date()
    }

    // Append to tracking activity timeline if status changed or note provided
    if (status || trackingNote) {
      order.trackingHistory.push({
        status: status || order.orderStatus,
        message: trackingNote || `Status updated to ${status?.replace(/_/g, ' ') || order.orderStatus}`,
        location: location || `${order.shippingAddress?.city || 'Hub'}, India`,
        timestamp: new Date(),
      })
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

// POST /api/orders/webhook/dropdash — Automated webhook from Dropdash or courier
export const handleDropdashWebhook = async (req, res) => {
  try {
    const payload = req.body || {}

    // Support flexible payloads from Dropdash or courier webhooks
    const lookupId =
      payload.trackingId ||
      payload.orderId ||
      payload.order_id ||
      payload.dropdashOrderId ||
      payload.awbNumber ||
      payload.awb

    if (!lookupId) {
      return res.status(400).json({ error: 'Missing trackingId, orderId, or AWB in payload' })
    }

    const query = {
      $or: [
        { trackingId: String(lookupId).trim() },
        { awbNumber: String(lookupId).trim() },
        { dropdashOrderId: String(lookupId).trim() },
      ],
    }

    if (String(lookupId).match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: lookupId })
    }

    const order = await Order.findOne(query)
    if (!order) {
      return res.status(404).json({ error: `Order matching '${lookupId}' not found` })
    }

    // Map incoming status string to our internal orderStatus enum
    const rawStatus = (payload.status || payload.current_status || payload.shipment_status || '').toLowerCase()
    let mappedStatus = null

    if (rawStatus.includes('deliver') && !rawStatus.includes('out')) {
      mappedStatus = 'delivered'
    } else if (rawStatus.includes('out_for_delivery') || rawStatus.includes('out for delivery')) {
      mappedStatus = 'out_for_delivery'
    } else if (rawStatus.includes('transit') || rawStatus.includes('in_transit')) {
      mappedStatus = 'in_transit'
    } else if (rawStatus.includes('dispatch') || rawStatus.includes('shipped') || rawStatus.includes('picked')) {
      mappedStatus = 'dispatched'
    } else if (rawStatus.includes('confirm')) {
      mappedStatus = 'confirmed'
    } else if (rawStatus.includes('cancel')) {
      mappedStatus = 'cancelled'
    } else if (rawStatus.includes('return') || rawStatus.includes('rto')) {
      mappedStatus = 'returned'
    }

    if (mappedStatus) {
      order.orderStatus = mappedStatus
      if (mappedStatus === 'delivered') {
        order.deliveredAt = new Date()
      }
    }

    if (payload.awb || payload.awbNumber) {
      order.awbNumber = payload.awb || payload.awbNumber
    }
    if (payload.courier || payload.courierPartner) {
      order.courierPartner = payload.courier || payload.courierPartner
    }
    if (payload.dropdashOrderId || payload.dropdash_order_id) {
      order.dropdashOrderId = payload.dropdashOrderId || payload.dropdash_order_id
    }

    // Append to live tracking scan history
    const message = payload.message || payload.activity || payload.scan_remark || `Status: ${mappedStatus || rawStatus}`
    const location = payload.location || payload.city || payload.hub || ''

    order.trackingHistory.push({
      status: mappedStatus || order.orderStatus,
      message,
      location,
      timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
    })

    await order.save()

    return res.status(200).json({
      success: true,
      message: 'Order updated from Dropdash webhook',
      trackingId: order.trackingId,
      orderStatus: order.orderStatus,
    })
  } catch (err) {
    console.error('Dropdash webhook error:', err)
    return res.status(500).json({ error: 'Webhook processing failed', details: err.message })
  }
}
