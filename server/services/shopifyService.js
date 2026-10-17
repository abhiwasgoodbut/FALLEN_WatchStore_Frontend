import https from 'https'
import Product from '../models/Product.js'

export const fetchShopifyProducts = () => {
  return new Promise((resolve, reject) => {
    const domain = process.env.SHOPIFY_STORE_DOMAIN || 'kmecmi-a0.myshopify.com'
    const token = process.env.SHOPIFY_STOREFRONT_TOKEN

    const query = `
    query {
      products(first: 100) {
        edges {
          node {
            id
            title
            handle
            description
            vendor
            productType
            tags
            availableForSale
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 10) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  availableForSale
                }
              }
            }
          }
        }
      }
    }
    `

    const postData = JSON.stringify({ query })

    const options = {
      hostname: domain,
      path: '/api/2024-04/graphql.json',
      method: 'POST',
      headers: {
        'Shopify-Storefront-Private-Token': token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.errors) {
            return reject(new Error(JSON.stringify(parsed.errors)))
          }
          const products = parsed.data?.products?.edges?.map((e) => e.node) || []
          resolve(products)
        } catch (err) {
          reject(err)
        }
      })
    })

    req.on('error', (err) => reject(err))
    req.write(postData)
    req.end()
  })
}

export const syncShopifyProductsToDatabase = async () => {
  const shopifyItems = await fetchShopifyProducts()
  const results = []

  for (const item of shopifyItems) {
    const rawVariant = item.variants?.edges?.[0]?.node
    const rawPrice = parseFloat(rawVariant?.price?.amount || item.priceRange?.minVariantPrice?.amount || '499')
    const rawComparePrice = parseFloat(rawVariant?.compareAtPrice?.amount || rawPrice * 1.6)

    // Determine clean prices
    const salePrice = rawPrice > 0 ? rawPrice : 499
    const price = rawComparePrice > salePrice ? rawComparePrice : Math.round(salePrice * 1.5)

    // Images
    const images = item.images?.edges?.map((edge, idx) => ({
      url: edge.node.url,
      public_id: `shopify_${item.id.split('/').pop()}_${idx}`,
    })) || []

    if (images.length === 0) {
      images.push({
        url: 'https://via.placeholder.com/600?text=Product+Image',
        public_id: 'placeholder',
      })
    }

    // Bullets / aboutItem
    const aboutItem = item.description
      ? item.description
          .split(/[\r\n]+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 5)
          .slice(0, 6)
      : ['Premium quality construction', 'Durable and long lasting']

    // Category mapping
    let category = 'home'
    const lowerTitle = (item.title + ' ' + (item.productType || '')).toLowerCase()
    if (lowerTitle.includes('yoga') || lowerTitle.includes('workout') || lowerTitle.includes('band') || lowerTitle.includes('fitness')) {
      category = 'sport'
    } else if (lowerTitle.includes('watch') || lowerTitle.includes('smart') || lowerTitle.includes('electronic')) {
      category = 'smart'
    } else if (lowerTitle.includes('clean') || lowerTitle.includes('mop') || lowerTitle.includes('home') || lowerTitle.includes('duster')) {
      category = 'home'
    }

    const updateData = {
      name: item.title,
      brand: (item.vendor || 'DROPDASH').toUpperCase(),
      description: item.description || item.title,
      price: price,
      salePrice: salePrice,
      category: category,
      images: images,
      aboutItem: aboutItem.length > 0 ? aboutItem : ['100% Quality Guaranteed', 'Easy to use and durable'],
      stock: 20,
      isFeatured: true,
      isBestseller: true,
      shopifyProductId: item.id,
      shopifyVariantId: rawVariant?.id,
      trustBadges: {
        isCodAvailable: true,
        returnPolicy: '7 Days Replacement',
        warranty: '1 Year Warranty',
        freeDelivery: true,
        topBrand: true,
        secureTransaction: true,
      },
    }

    // Upsert by shopifyProductId or by matching title
    let product = await Product.findOne({
      $or: [
        { shopifyProductId: item.id },
        { name: item.title },
      ],
    })

    if (product) {
      // Update existing
      Object.assign(product, updateData)
      await product.save()
      results.push({ action: 'updated', product })
    } else {
      // Create new
      product = await Product.create(updateData)
      results.push({ action: 'created', product })
    }
  }

  return results
}

/**
 * Creates a real Shopify Checkout URL using Storefront cartCreate mutation
 * @param {Array} lineItems - Array of { variantId, quantity }
 * @param {Object} customerAddress - shipping address details (optional)
 * @returns {Promise<string>} Checkout URL
 */
export const createShopifyCheckoutUrl = (lineItems = [], customerAddress = null) => {
  return new Promise((resolve, reject) => {
    const domain = process.env.SHOPIFY_STORE_DOMAIN || 'kmecmi-a0.myshopify.com'
    const token = process.env.SHOPIFY_STOREFRONT_TOKEN

    const query = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
    `

    const input = {
      lines: lineItems.map(item => ({
        merchandiseId: item.variantId,
        quantity: item.quantity || 1,
      })),
    }

    // Pre-fill customer address and contact so Shopify does NOT ask again!
    if (customerAddress) {
      const names = (customerAddress.fullName || '').trim().split(/\s+/)
      const firstName = names[0] || 'Customer'
      const lastName = names.slice(1).join(' ') || ''
      const rawPhone = (customerAddress.phone || '').replace(/[^0-9]/g, '')
      const formattedPhone = rawPhone ? (rawPhone.startsWith('91') ? `+${rawPhone}` : `+91${rawPhone.slice(-10)}`) : undefined

      input.buyerIdentity = {
        email: customerAddress.email || undefined,
        phone: formattedPhone,
        deliveryAddressPreferences: [
          {
            deliveryAddress: {
              address1: [customerAddress.addressLine1, customerAddress.addressLine2].filter(Boolean).join(', ') || 'Address',
              city: customerAddress.city || 'City',
              province: customerAddress.state || '',
              zip: customerAddress.pincode || '',
              country: 'IN',
            },
          },
        ],
      }
    }

    const postData = JSON.stringify({
      query,
      variables: { input },
    })

    const options = {
      hostname: domain,
      path: '/api/2024-04/graphql.json',
      method: 'POST',
      headers: {
        'Shopify-Storefront-Private-Token': token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.errors) {
            return reject(new Error(JSON.stringify(parsed.errors)))
          }
          const checkoutUrl = parsed.data?.cartCreate?.cart?.checkoutUrl
          if (!checkoutUrl) {
            const errs = parsed.data?.cartCreate?.userErrors || []
            return reject(new Error(errs.map(e => e.message).join(', ') || 'Failed to generate checkout URL'))
          }
          resolve(checkoutUrl)
        } catch (err) {
          reject(err)
        }
      })
    })

    req.on('error', err => reject(err))
    req.write(postData)
    req.end()
  })
}
