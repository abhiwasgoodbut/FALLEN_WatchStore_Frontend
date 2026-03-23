import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.Mixed, ref: 'Product' },
  name:     { type: String, required: true },
  image:    { type: String },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
})

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    fullName:     { type: String, required: true },
    phone:        { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city:         { type: String, required: true },
    state:        { type: String, required: true },
    pincode:      { type: String, required: true },
    country:      { type: String, default: 'India' },
  },
  paymentInfo: {
    razorpayOrderId:   String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    method:            String,
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
  },
  itemsTotal:    { type: Number, required: true },
  shippingCharge: { type: Number, default: 0 },
  discount:      { type: Number, default: 0 },
  totalAmount:   { type: Number, required: true },
  orderStatus: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing',
  },
  couponApplied: { type: String },
  trackingId:    { type: String },
  deliveredAt:   { type: Date },
}, { timestamps: true })

// Index for user's orders and tracking
orderSchema.index({ user: 1, createdAt: -1 })
orderSchema.index({ trackingId: 1 })

const Order = mongoose.model('Order', orderSchema)
export default Order
