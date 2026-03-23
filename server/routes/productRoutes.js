import express from 'express'
import {
  getProducts, getProductById, createProduct,
  updateProduct, deleteProduct, getFeaturedProducts, getBestsellers,
} from '../controllers/productController.js'
import { protect, admin } from '../middleware/auth.js'

const router = express.Router()

router.get('/featured', getFeaturedProducts)
router.get('/bestsellers', getBestsellers)
router.get('/', getProducts)
router.get('/:id', getProductById)
router.post('/', protect, admin, createProduct)
router.put('/:id', protect, admin, updateProduct)
router.delete('/:id', protect, admin, deleteProduct)

export default router
