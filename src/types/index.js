/**
 * ===== LUXE Type Definitions =====
 */
/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} category_id
 * @property {string} name
 * @property {string} slug
 * @property {string} description
 * @property {string} brand
 * @property {number} price
 * @property {number} [compare_at_price]
 * @property {number} stock_quantity
 * @property {ProductVariant[]} [variants]
 * @property {string[]} sizes
 * @property {string[]} colors
 * @property {number} rating
 * @property {number} review_count
 * @property {boolean} is_featured
 * @property {boolean} is_active
 * @property {ProductImage[]} images
 * @property {string} created_at
 */
/**
 * @typedef {Object} ProductVariant
 * @property {string} id
 * @property {string} product_id
 * @property {string} size
 * @property {string} color
 * @property {number} stock_quantity
 * @property {string} [sku]
 * @property {number} [price_override]
 */
/**
 * @typedef {Object} ProductImage
 * @property {string} id
 * @property {string} url
 * @property {number} sort_order
 * @property {boolean} is_primary
 */
/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} description
 * @property {string} image_url
 * @property {number} sort_order
 * @property {number} [product_count]
 */
/**
 * @typedef {Object} CartItem
 * @property {string} id
 * @property {string} productId
 * @property {Product} product
 * @property {number} quantity
 * @property {string} size
 * @property {string} color
 */
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} [avatar_url]
 * @property {string} [phone]
 * @property {'user' | 'admin'} role
 * @property {string} created_at
 */
/**
 * @typedef {Object} Address
 * @property {string} id
 * @property {string} user_id
 * @property {string} label
 * @property {string} full_name
 * @property {string} street
 * @property {string} city
 * @property {string} state
 * @property {string} zip_code
 * @property {string} country
 * @property {string} phone
 * @property {boolean} is_default
 */
/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} user_id
 * @property {string} full_name
 * @property {string} email
 * @property {string} phone
 * @property {string} address
 * @property {string} city
 * @property {string} state
 * @property {string} country
 * @property {string} zip_code
 * @property {'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'} status
 * @property {number} subtotal
 * @property {number} shipping_cost
 * @property {number} tax
 * @property {number} total
 * @property {'card' | 'cod'} payment_method
 * @property {'pending' | 'paid' | 'failed' | 'refunded'} payment_status
 * @property {OrderItem[]} items
 * @property {string} created_at
 */
/**
 * @typedef {Object} OrderItem
 * @property {string} id
 * @property {string} order_id
 * @property {string} product_id
 * @property {string} [variant_id]
 * @property {string} product_name
 * @property {string} product_image
 * @property {number} quantity
 * @property {string} size
 * @property {string} color
 * @property {number} price_at_purchase
 */
/**
 * @typedef {Object} FilterState
 * @property {string} category
 * @property {[number, number]} priceRange
 * @property {string[]} brands
 * @property {string[]} sizes
 * @property {string[]} colors
 * @property {number} rating
 * @property {'newest' | 'price-asc' | 'price-desc' | 'rating' | 'name'} sortBy
 * @property {string} search
 */
/**
 * @typedef {Object} CheckoutState
 * @property {'shipping' | 'payment' | 'review' | 'confirmation'} step
 * @property {Address | null} address
 * @property {PaymentMethod | null} paymentMethod
 */
/**
 * @typedef {Object} PaymentMethod
 * @property {string} cardNumber
 * @property {string} cardHolder
 * @property {string} expiryDate
 * @property {string} cvv
 * @property {'visa' | 'mastercard' | 'amex' | 'discover'} brand
 */
/**
 * @typedef {Object} PaymentIntent
 * @property {string} id
 * @property {number} amount
 * @property {string} currency
 * @property {'pending' | 'succeeded' | 'failed'} status
 * @property {string} created_at
 */
/**
 * @typedef {Object} ToastMessage
 * @property {string} id
 * @property {'success' | 'error' | 'warning' | 'info'} type
 * @property {string} title
 * @property {string} [description]
 * @property {number} [duration]
 */
