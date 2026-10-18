import express from 'express'
import {
  getProducts, getProductById, createProduct,
  updateProduct, deleteProduct, getFeaturedProducts, getBestsellers,
  syncShopify, handleShopifyWebhook,
} from '../controllers/productController.js'
import { protect, admin } from '../middleware/auth.js'

const router = express.Router()

router.get('/featured', getFeaturedProducts)
router.get('/bestsellers', getBestsellers)
router.get('/sync-shopify', syncShopify)
router.post('/sync-shopify', syncShopify)
router.post('/webhook/shopify', handleShopifyWebhook)
router.get('/', getProducts)
router.get('/:id', getProductById)
router.post('/', protect, admin, createProduct)
router.put('/:id', protect, admin, updateProduct)
router.delete('/:id', protect, admin, deleteProduct)

export default router
