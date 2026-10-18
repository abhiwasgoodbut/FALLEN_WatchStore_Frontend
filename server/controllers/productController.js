import Product from '../models/Product.js'

let lastShopifySyncTime = 0

// GET /api/products — list with filter, sort, search, pagination
export const getProducts = async (req, res, next) => {
  try {
    // Automatically keep products synced with Shopify if > 2 minutes old
    if (Date.now() - lastShopifySyncTime > 2 * 60 * 1000) {
      lastShopifySyncTime = Date.now()
      import('../services/shopifyService.js')
        .then(({ syncShopifyProductsToDatabase }) => syncShopifyProductsToDatabase())
        .catch((e) => console.log('[Auto Shopify Sync Note]', e.message))
    }

    const { category, brand, search, sort, minPrice, maxPrice, page = 1, limit = 12 } = req.query

    const filter = {}

    if (category) filter.category = category
    if (brand) filter.brand = brand.toUpperCase()
    if (minPrice || maxPrice) {
      filter.salePrice = {}
      if (minPrice) filter.salePrice.$gte = Number(minPrice)
      if (maxPrice) filter.salePrice.$lte = Number(maxPrice)
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ]
    }

    let sortOption = { createdAt: -1 }
    if (sort === 'price_asc') sortOption = { salePrice: 1 }
    else if (sort === 'price_desc') sortOption = { salePrice: -1 }
    else if (sort === 'name_asc') sortOption = { name: 1 }
    else if (sort === 'rating') sortOption = { averageRating: -1 }
    else if (sort === 'bestseller') sortOption = { isBestseller: -1 }

    const skip = (Number(page) - 1) * Number(limit)
    const total = await Product.countDocuments(filter)
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))

    res.json({
      products,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/products/:id
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    next(error)
  }
}

// POST /api/products — Admin
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json(product)
  } catch (error) {
    next(error)
  }
}

// PUT /api/products/:id — Admin
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    next(error)
  }
}

// DELETE /api/products/:id — Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json({ message: 'Product deleted' })
  } catch (error) {
    next(error)
  }
}

// GET /api/products/featured
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(8)
    res.json(products)
  } catch (error) {
    next(error)
  }
}

// GET /api/products/bestsellers
export const getBestsellers = async (req, res, next) => {
  try {
    const products = await Product.find({ isBestseller: true }).limit(8)
    res.json(products)
  } catch (error) {
    next(error)
  }
}

// POST /api/products/sync-shopify
export const syncShopify = async (req, res, next) => {
  try {
    const { syncShopifyProductsToDatabase } = await import('../services/shopifyService.js')
    const results = await syncShopifyProductsToDatabase()
    res.json({
      success: true,
      message: `Successfully synced ${results.length} products from Shopify`,
      syncedCount: results.length,
      results: results.map(r => ({ action: r.action, title: r.product.name, id: r.product._id }))
    })
  } catch (error) {
    console.error('Shopify sync error:', error)
    res.status(500).json({ success: false, message: 'Shopify sync failed', error: error.message })
  }
}

// POST /api/products/webhook/shopify — Real-time webhook from Shopify
export const handleShopifyWebhook = async (req, res) => {
  try {
    const { syncShopifyProductsToDatabase } = await import('../services/shopifyService.js')
    await syncShopifyProductsToDatabase()
    res.status(200).send('OK')
  } catch (error) {
    console.error('Shopify webhook sync error:', error)
    res.status(500).send('Webhook processing failed')
  }
}


