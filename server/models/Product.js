import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
    uppercase: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  salePrice: {
    type: Number,
    required: [true, 'Sale price is required'],
    min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: ['luxury', 'classic', 'sport', 'smart'],
  },
  images: [{
    url:       { type: String, required: true },
    public_id: { type: String, required: true },
  }],
  specs: {
    type: Map,
    of: String,
    default: {},
  },
  stock: {
    type: Number,
    default: 10,
    min: 0,
  },
  isFeatured:   { type: Boolean, default: false },
  isBestseller: { type: Boolean, default: false },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews:    { type: Number, default: 0 },
}, { timestamps: true })

// Text index for search
productSchema.index({ name: 'text', brand: 'text', description: 'text' })
// Category + price index for filter queries
productSchema.index({ category: 1, salePrice: 1 })

const Product = mongoose.model('Product', productSchema)
export default Product
