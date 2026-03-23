import Cart from '../models/Cart.js'

// GET /api/cart
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product')
    if (!cart) {
      cart = { user: req.user._id, items: [] }
    }
    res.json(cart)
  } catch (error) {
    next(error)
  }
}

// POST /api/cart — add item
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body

    let cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, quantity }],
      })
    } else {
      const existingItem = cart.items.find(
        item => item.product.toString() === productId
      )

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        cart.items.push({ product: productId, quantity })
      }

      await cart.save()
    }

    cart = await Cart.findOne({ user: req.user._id }).populate('items.product')
    res.json(cart)
  } catch (error) {
    next(error)
  }
}

// PUT /api/cart/:itemId — update quantity
export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body
    const cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    const item = cart.items.id(req.params.itemId)
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' })
    }

    item.quantity = quantity
    await cart.save()

    const updated = await Cart.findOne({ user: req.user._id }).populate('items.product')
    res.json(updated)
  } catch (error) {
    next(error)
  }
}

// DELETE /api/cart/:itemId — remove item
export const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    cart.items.pull(req.params.itemId)
    await cart.save()

    const updated = await Cart.findOne({ user: req.user._id }).populate('items.product')
    res.json(updated)
  } catch (error) {
    next(error)
  }
}

// DELETE /api/cart — clear cart
export const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id })
    res.json({ message: 'Cart cleared' })
  } catch (error) {
    next(error)
  }
}
