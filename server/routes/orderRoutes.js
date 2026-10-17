import express from 'express'
import {
  createOrder, verifyPayment, getMyOrders,
  getOrderById, trackOrder, updateOrderStatus, getAllOrders, cancelOrder,
  handleDropdashWebhook,
} from '../controllers/orderController.js'
import { protect, admin } from '../middleware/auth.js'

const router = express.Router()

// Public Tracking & Webhooks
router.get('/track/:trackingId', trackOrder)
router.post('/webhook/dropdash', handleDropdashWebhook)

// Protected
router.post('/shopify-checkout', protect, async (req, res, next) => {
  try {
    const { cartItems } = req.body
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

      if (!variantId && itemId && /^[0-9a-fA-F]{24}$/.test(String(itemId))) {
        const prod = await Product.findById(itemId)
        if (prod?.shopifyVariantId) {
          variantId = prod.shopifyVariantId
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

    const checkoutUrl = await createShopifyCheckoutUrl(lineItems)
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
