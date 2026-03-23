import Wishlist from '../models/Wishlist.js'

// GET /api/wishlist
export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products')
    if (!wishlist) {
      wishlist = { user: req.user._id, products: [] }
    }
    res.json(wishlist)
  } catch (error) {
    next(error)
  }
}

// POST /api/wishlist/:productId — toggle (add/remove)
export const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params

    let wishlist = await Wishlist.findOne({ user: req.user._id })

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [productId],
      })
    } else {
      const index = wishlist.products.findIndex(
        id => id.toString() === productId
      )

      if (index > -1) {
        wishlist.products.splice(index, 1) // Remove
      } else {
        wishlist.products.push(productId)   // Add
      }

      await wishlist.save()
    }

    wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products')
    res.json(wishlist)
  } catch (error) {
    next(error)
  }
}
