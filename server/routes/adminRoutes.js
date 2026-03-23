import express from 'express'
import {
  getDashboardStats, getAllUsers, updateUserRole, deleteUser,
  createCoupon, getCoupons, updateCoupon, deleteCoupon,
} from '../controllers/adminController.js'
import { protect, admin } from '../middleware/auth.js'

const router = express.Router()

router.use(protect, admin) // All admin routes require admin role

// Dashboard
router.get('/stats', getDashboardStats)

// User management
router.get('/users', getAllUsers)
router.put('/users/:id/role', updateUserRole)
router.delete('/users/:id', deleteUser)

// Coupon management
router.post('/coupon', createCoupon)
router.get('/coupons', getCoupons)
router.put('/coupon/:id', updateCoupon)
router.delete('/coupon/:id', deleteCoupon)

export default router
