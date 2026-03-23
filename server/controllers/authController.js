import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body

    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const user = await User.create({ firstName, lastName, email, phone, password })

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    })
  } catch (error) {
    next(error)
  }
}

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/auth/profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    res.json(user)
  } catch (error) {
    next(error)
  }
}

// PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body
    const user = await User.findById(req.user._id)

    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName
    if (phone) user.phone = phone
    if (avatar) user.avatar = avatar

    const updated = await user.save()
    res.json(updated)
  } catch (error) {
    next(error)
  }
}

// PUT /api/auth/password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id).select('+password')

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    user.password = newPassword
    await user.save()

    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    next(error)
  }
}

// POST /api/auth/address
export const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)

    // If this is first address or marked default, unset previous defaults
    if (req.body.isDefault || user.addresses.length === 0) {
      user.addresses.forEach(addr => { addr.isDefault = false })
      req.body.isDefault = true
    }

    user.addresses.push(req.body)
    await user.save()

    res.status(201).json(user.addresses)
  } catch (error) {
    next(error)
  }
}

// PUT /api/auth/address/:id
export const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    const address = user.addresses.id(req.params.id)

    if (!address) {
      return res.status(404).json({ message: 'Address not found' })
    }

    if (req.body.isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false })
    }

    Object.assign(address, req.body)
    await user.save()

    res.json(user.addresses)
  } catch (error) {
    next(error)
  }
}

// DELETE /api/auth/address/:id
export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    user.addresses.pull(req.params.id)
    await user.save()

    res.json(user.addresses)
  } catch (error) {
    next(error)
  }
}
