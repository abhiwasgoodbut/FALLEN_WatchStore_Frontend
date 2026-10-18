import express from 'express'
import {
  createOrder, verifyPayment, getMyOrders,
  getOrderById, trackOrder, updateOrderStatus, getAllOrders, cancelOrder,
  handleDropdashWebhook,
} from '../controllers/orderController.js'
import { protect, admin, optionalProtect } from '../middleware/auth.js'

const router = express.Router()

// Public Tracking & Webhooks
router.get('/track/:trackingId', trackOrder)
router.post('/webhook/dropdash', handleDropdashWebhook)

// Shopify Direct Checkout - GET test/health check
router.get('/shopify-checkout', (req, res) => {
  res.json({
    status: 'online',
    endpoint: '/api/orders/shopify-checkout',
    message: 'Shopify checkout endpoint is active! Please use HTTP POST with cartItems to create a checkout session.',
  })
})

// Shopify Direct Checkout (Guest & Auth friendly)
router.post('/shopify-checkout', optionalProtect, async (req, res, next) => {
  try {
    const { cartItems } = req.body
    console.log(`[Shopify Checkout] Incoming request for ${cartItems?.length || 0} item(s):`, JSON.stringify(cartItems))
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' })
    }

    const { createShopifyCheckoutUrl } = await import('../services/shopifyService.js')
    const Product = (await import('../models/Product.js')).default

    // Find line items that belong to Shopify
    const lineItems = []

    for (const item of cartItems) {
      const itemId = item.id || item._id
      let variantId = item.shopifyVariantId

      // 1. Check direct MongoDB ObjectId
      if (!variantId && itemId && /^[0-9a-fA-F]{24}$/.test(String(itemId))) {
        const prod = await Product.findById(itemId)
        if (prod?.shopifyVariantId) {
          variantId = prod.shopifyVariantId
        }
      }

      // 2. Fallback: match by exact product name in database
      if (!variantId && item.name) {
        const prod = await Product.findOne({ name: item.name })
        if (prod?.shopifyVariantId) {
          variantId = prod.shopifyVariantId
        }
      }

      // 3. Fallback: match by partial name/title in database
      if (!variantId && item.name) {
        const firstWords = item.name.trim().split(/\s+/).slice(0, 3).join(' ')
        if (firstWords.length >= 3) {
          const prod = await Product.findOne({ name: { $regex: firstWords, $options: 'i' } })
          if (prod?.shopifyVariantId) {
            variantId = prod.shopifyVariantId
          }
        }
      }

      // 4. Fallback: match by keywords
      if (!variantId && item.name) {
        const lower = item.name.toLowerCase()
        if (lower.includes('mop') || lower.includes('clean') || lower.includes('fan')) {
          const prod = await Product.findOne({ name: { $regex: 'mop', $options: 'i' } })
          if (prod?.shopifyVariantId) variantId = prod.shopifyVariantId
        } else if (lower.includes('band') || lower.includes('yoga') || lower.includes('resistance')) {
          const prod = await Product.findOne({ name: { $regex: 'band', $options: 'i' } })
          if (prod?.shopifyVariantId) variantId = prod.shopifyVariantId
        }
      }

      if (variantId) {
        lineItems.push({
          variantId,
          quantity: item.quantity || 1,
        })
      }
    }

    // If no items in cart belong to Shopify, tell frontend to use internal Razorpay/COD
    if (lineItems.length === 0) {
      return res.json({ success: false, isShopify: false, message: 'No Shopify products in cart' })
    }

    const userEmail = req.user?.email || req.body.shippingAddress?.email
    const addressToPass = req.body.shippingAddress ? { ...req.body.shippingAddress, email: userEmail } : null

    const checkoutUrl = await createShopifyCheckoutUrl(lineItems, addressToPass)
    res.json({ success: true, isShopify: true, checkoutUrl })
  } catch (err) {
    console.error('Shopify checkout creation error:', err)
    res.status(500).json({ success: false, message: 'Could not create Shopify checkout', error: err.message })
  }
})

router.post('/', protect, createOrder)
router.post('/verify', protect, verifyPayment)
router.get('/my', protect, getMyOrders)
router.get('/:id', protect, getOrderById)
router.put('/:id/cancel', protect, cancelOrder)

// Admin
router.get('/', protect, admin, getAllOrders)
router.put('/:id/status', protect, admin, updateOrderStatus)

export default router
