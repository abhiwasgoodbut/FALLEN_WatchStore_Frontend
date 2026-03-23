import cloudinary from '../config/cloudinary.js'

// POST /api/upload — upload image to Cloudinary
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' })
    }

    // Upload buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'fallen-watches',
          transformation: [
            { width: 800, height: 800, crop: 'limit', quality: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(error)
          } else {
            resolve(result)
          }
        }
      )
      stream.end(req.file.buffer)
    })

    res.status(201).json({
      url: result.secure_url,
      public_id: result.public_id,
    })
  } catch (error) {
    console.error('Upload error full detail:', error)
    res.status(500).json({
      message: error.message || error.error?.message || 'Image upload failed — check Cloudinary credentials',
    })
  }
}

// DELETE /api/upload/:public_id — remove image from Cloudinary
export const deleteImage = async (req, res, next) => {
  try {
    // public_id may contain slashes (folder/name), passed as query param
    const publicId = req.query.public_id || req.params.public_id

    await cloudinary.uploader.destroy(publicId)
    res.json({ message: 'Image deleted' })
  } catch (error) {
    next(error)
  }
}
