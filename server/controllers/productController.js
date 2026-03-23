import Product from '../models/Product.js'

// GET /api/products — list with filter, sort, search, pagination
export const getProducts = async (req, res, next) => {
  try {
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
