import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: 0,
  },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount:    { type: Number },
  usageLimit:     { type: Number },
  usedCount:      { type: Number, default: 0 },
  isActive:       { type: Boolean, default: true },
  expiresAt:      { type: Date },
}, { timestamps: true })

// Check if coupon is valid
couponSchema.methods.isValid = function () {
  if (!this.isActive) return false
  if (this.expiresAt && this.expiresAt < new Date()) return false
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false
  return true
}

// Calculate discount for a given order total
couponSchema.methods.calcDiscount = function (orderTotal) {
  if (orderTotal < this.minOrderAmount) return 0

  let discount = 0
  if (this.discountType === 'percentage') {
    discount = (orderTotal * this.discountValue) / 100
    if (this.maxDiscount) discount = Math.min(discount, this.maxDiscount)
  } else {
    discount = this.discountValue
  }

  return Math.min(discount, orderTotal)
}

const Coupon = mongoose.model('Coupon', couponSchema)
export default Coupon
