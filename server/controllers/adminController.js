import User from '../models/User.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import Review from '../models/Review.js'
import Coupon from '../models/Coupon.js'

// GET /api/admin/stats — comprehensive dashboard analytics
export const getDashboardStats = async (req, res, next) => {
  try {
    // ── Basic Counts ─────────────────────────────────────
    const totalUsers = await User.countDocuments()
    const totalProducts = await Product.countDocuments()
    const totalOrders = await Order.countDocuments()
    const totalReviews = await Review.countDocuments()

    // ── Revenue Stats ────────────────────────────────────
    const revenueAgg = await Order.aggregate([
      { $match: { 'paymentInfo.status': 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalDiscount: { $sum: '$discount' },
          totalShipping: { $sum: '$shippingCharge' },
          avgOrderValue: { $avg: '$totalAmount' },
          paidOrders: { $sum: 1 },
        },
      },
    ])

    const revenue = revenueAgg[0] || {
      totalRevenue: 0, totalDiscount: 0, totalShipping: 0, avgOrderValue: 0, paidOrders: 0,
    }

    // ── Order Status Breakdown ───────────────────────────
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ])

    // ── Monthly Revenue (last 12 months) ─────────────────
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          'paymentInfo.status': 'paid',
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    // ── Daily Orders (last 30 days) ──────────────────────
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$paymentInfo.status', 'paid'] }, '$totalAmount', 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // ── Top Selling Products ─────────────────────────────
    const topProducts = await Order.aggregate([
      { $match: { 'paymentInfo.status': 'paid' } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          totalSold: { $sum: '$orderItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ])

    // ── Category Revenue ─────────────────────────────────
    const categoryRevenue = await Order.aggregate([
      { $match: { 'paymentInfo.status': 'paid' } },
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
          count: { $sum: '$orderItems.quantity' },
        },
      },
      { $sort: { revenue: -1 } },
    ])

    // ── New Users (last 30 days) ─────────────────────────
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    })

    // ── Recent Orders ────────────────────────────────────
    const recentOrders = await Order.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('user totalAmount orderStatus paymentInfo.status createdAt trackingId')

    // ── Low Stock Products ───────────────────────────────
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
      .select('name brand stock images')
      .sort({ stock: 1 })
      .limit(10)

    res.json({
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalReviews,
        totalRevenue: revenue.totalRevenue,
        totalDiscount: revenue.totalDiscount,
        avgOrderValue: Math.round(revenue.avgOrderValue),
        paidOrders: revenue.paidOrders,
        newUsersThisMonth,
      },
      ordersByStatus,
      monthlyRevenue,
      dailyOrders,
      topProducts,
      categoryRevenue,
      recentOrders,
      lowStockProducts,
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/admin/users — all users with pagination
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query
    const filter = {}
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (Number(page) - 1) * Number(limit)
    const total = await User.countDocuments(filter)
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    res.json({ users, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) })
  } catch (error) {
    next(error)
  }
}

// PUT /api/admin/users/:id/role — change user role
export const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    user.role = req.body.role
    await user.save()
    res.json(user)
  } catch (error) {
    next(error)
  }
}

// DELETE /api/admin/users/:id — delete user
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ message: 'User deleted' })
  } catch (error) {
    next(error)
  }
}

// POST /api/admin/coupon
export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body)
    res.status(201).json(coupon)
  } catch (error) {
    next(error)
  }
}

// GET /api/admin/coupons
export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 })
    res.json(coupons)
  } catch (error) {
    next(error)
  }
}

// PUT /api/admin/coupon/:id
export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' })
    res.json(coupon)
  } catch (error) {
    next(error)
  }
}

// DELETE /api/admin/coupon/:id
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id)
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' })
    res.json({ message: 'Coupon deleted' })
  } catch (error) {
    next(error)
  }
}
