import Review from '../models/Review.js'

// POST /api/reviews/:productId
export const addReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body

    // Upsert: update if exists, create if not
    const review = await Review.findOneAndUpdate(
      { user: req.user._id, product: req.params.productId },
      { rating, title, comment, user: req.user._id, product: req.params.productId },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )

    // Trigger rating recalculation
    await Review.calcAverageRating(review.product)

    res.status(201).json(review)
  } catch (error) {
    next(error)
  }
}

// GET /api/reviews/:productId
export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'firstName lastName avatar')
      .sort({ createdAt: -1 })

    res.json(reviews)
  } catch (error) {
    next(error)
  }
}

// DELETE /api/reviews/:reviewId
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId)

    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const productId = review.product
    await Review.findByIdAndDelete(req.params.reviewId)
    await Review.calcAverageRating(productId)

    res.json({ message: 'Review deleted' })
  } catch (error) {
    next(error)
  }
}
