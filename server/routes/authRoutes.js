import express from 'express'
import {
  register, login, getProfile, updateProfile,
  changePassword, addAddress, updateAddress, deleteAddress,
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/profile', protect, getProfile)
router.put('/profile', protect, updateProfile)
router.put('/password', protect, changePassword)
router.post('/address', protect, addAddress)
router.put('/address/:id', protect, updateAddress)
router.delete('/address/:id', protect, deleteAddress)

export default router
