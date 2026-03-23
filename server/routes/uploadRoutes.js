import express from 'express'
import { uploadImage, deleteImage } from '../controllers/uploadController.js'
import { protect, admin } from '../middleware/auth.js'
import upload from '../middleware/upload.js'

const router = express.Router()

router.post('/', protect, admin, upload.single('image'), uploadImage)
router.delete('/', protect, admin, deleteImage)

export default router
