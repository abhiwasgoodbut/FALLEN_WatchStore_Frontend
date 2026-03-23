import express from 'express'
import {
  createOrder, verifyPayment, getMyOrders,
  getOrderById, trackOrder, updateOrderStatus, getAllOrders, cancelOrder,
} from '../controllers/orderController.js'
import { protect, admin } from '../middleware/auth.js'

const router = express.Router()

// Public
router.get('/track/:trackingId', trackOrder)

// Protected
router.post('/', protect, createOrder)
router.post('/verify', protect, verifyPayment)
router.get('/my', protect, getMyOrders)
router.get('/:id', protect, getOrderById)
router.put('/:id/cancel', protect, cancelOrder)

// Admin
router.get('/', protect, admin, getAllOrders)
router.put('/:id/status', protect, admin, updateOrderStatus)

export default router
