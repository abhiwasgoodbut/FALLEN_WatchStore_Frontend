import express from 'express'
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect) // All cart routes require auth

router.get('/', getCart)
router.post('/', addToCart)
router.put('/:itemId', updateCartItem)
router.delete('/clear', clearCart)
router.delete('/:itemId', removeFromCart)

export default router
