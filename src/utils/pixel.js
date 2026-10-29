// Meta (Facebook) Pixel Integration
// Pixel ID: 1850895939415688

export const FB_PIXEL_ID = '1850895939415688'

/**
 * Safely dispatch a standard event to Meta Pixel
 */
export const trackEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      if (Object.keys(params).length > 0) {
        window.fbq('track', eventName, params)
      } else {
        window.fbq('track', eventName)
      }
    } catch (err) {
      console.warn(`[Meta Pixel] Error tracking event "${eventName}":`, err)
    }
  }
}

/**
 * Safely dispatch a custom event to Meta Pixel
 */
export const trackCustomEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('trackCustom', eventName, params)
    } catch (err) {
      console.warn(`[Meta Pixel] Error tracking custom event "${eventName}":`, err)
    }
  }
}

/**
 * Track standard PageView on initial load or route transition
 */
export const trackPageView = () => {
  trackEvent('PageView')
}

/**
 * Track ViewContent when a user views a product
 */
export const trackViewContent = (product) => {
  if (!product) return
  const id = product.id || product._id || product.shopifyProductId
  const price = Number(product.salePrice ?? product.price ?? 0)

  trackEvent('ViewContent', {
    content_name: product.name || product.title,
    content_category: product.category || 'General',
    content_ids: id ? [String(id)] : [],
    content_type: 'product',
    value: price,
    currency: 'INR',
  })
}

/**
 * Track AddToCart when a product is added to cart
 */
export const trackAddToCart = (product, quantity = 1) => {
  if (!product) return
  const id = product.id || product._id || product.shopifyProductId
  const price = Number(product.salePrice ?? product.price ?? 0)

  trackEvent('AddToCart', {
    content_name: product.name || product.title,
    content_category: product.category || 'General',
    content_ids: id ? [String(id)] : [],
    content_type: 'product',
    value: price * quantity,
    currency: 'INR',
  })
}

/**
 * Track InitiateCheckout when the user begins checkout
 */
export const trackInitiateCheckout = (cartItems = [], totalAmount = 0) => {
  const contentIds = cartItems
    .map(item => String(item.id || item._id || item.shopifyProductId))
    .filter(Boolean)
  const numItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)

  trackEvent('InitiateCheckout', {
    content_ids: contentIds,
    contents: cartItems.map(item => ({
      id: String(item.id || item._id || item.shopifyProductId),
      quantity: item.quantity || 1,
      item_price: Number(item.salePrice ?? item.price ?? 0),
    })),
    num_items: numItems,
    value: Number(totalAmount) || 0,
    currency: 'INR',
  })
}

/**
 * Track AddToWishlist
 */
export const trackAddToWishlist = (product) => {
  if (!product) return
  const id = product.id || product._id || product.shopifyProductId
  const price = Number(product.salePrice ?? product.price ?? 0)

  trackEvent('AddToWishlist', {
    content_name: product.name || product.title,
    content_category: product.category || 'General',
    content_ids: id ? [String(id)] : [],
    content_type: 'product',
    value: price,
    currency: 'INR',
  })
}

/**
 * Track Search query
 */
export const trackSearch = (searchString) => {
  if (!searchString || !searchString.trim()) return
  trackEvent('Search', {
    search_string: searchString.trim(),
  })
}

/**
 * Track Contact Form Submission
 */
export const trackContact = () => {
  trackEvent('Contact')
}
