import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import connectDB, { getLastConnectionError } from './config/db.js'
import errorHandler from './middleware/errorHandler.js'

// Route imports
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import wishlistRoutes from './routes/wishlistRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

// Initial connection attempt
connectDB().catch((err) => console.error('Initial DB connect note:', err.message))

const app = express()

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server) or matching origins
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true)
    } else {
      callback(null, true) // Allow all for seamless headless checkout
    }
  },
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Ensure DB is connected for serverless invocations
app.use(async (req, res, next) => {
  if (req.path === '/api/health' || req.path === '/health') {
    return next()
  }
  const conn = await connectDB()
  if (!conn && mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database connection failed',
      details: getLastConnectionError() || 'Unable to connect to MongoDB'
    })
  }
  next()
})

// Health check
app.get(['/api/health', '/health'], async (req, res) => {
  await connectDB()
  const isConnected = mongoose.connection.readyState === 1
  res.json({
    status: isConnected ? 'ok' : 'degraded',
    message: isConnected ? 'FALLEN API is running 🚀' : 'FALLEN API is running but database is not connected',
    dbState: isConnected ? 'connected' : 'disconnected',
    dbError: getLastConnectionError(),
    hasMongoUri: Boolean(process.env.MONGO_URI),
    environment: process.env.VERCEL ? 'vercel' : 'local'
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/admin', adminRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` })
})

// Global error handler
app.use(errorHandler)

// Start server locally (Vercel serverless handles execution without app.listen)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════╗
  ║   FALLEN API Server                   ║
  ║   Running on port ${PORT}                ║
  ║   Mode: ${process.env.NODE_ENV || 'development'}                   ║
  ╚═══════════════════════════════════════╝
    `)

    // Automatically sync Shopify products in background on startup and every 3 minutes
    const syncShopify = () => {
      import('./services/shopifyService.js')
        .then(({ syncShopifyProductsToDatabase }) => syncShopifyProductsToDatabase())
        .then((results) => console.log(`[Shopify Sync] Synced ${results.length} products`))
        .catch((err) => console.log('[Shopify Sync Note]', err.message))
    }

    syncShopify()
    setInterval(syncShopify, 3 * 60 * 1000)
  })
}

export default app
