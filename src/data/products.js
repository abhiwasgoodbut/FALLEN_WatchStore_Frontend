const products = [
  {
    id: 1,
    name: "Extendable Microfiber Feather Duster (100 Inch)",
    brand: "SENVOX",
    price: 1299,
    salePrice: 699,
    category: "home",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80", public_id: "prod1_1" },
      { url: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop&q=80", public_id: "prod1_2" },
      { url: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop&q=80", public_id: "prod1_3" }
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    videoPosition: 2,
    description: "Extra-long telescopic microfiber feather duster with bendable head. Reach high ceilings, fan blades, and corners safely without a ladder.",
    aboutItem: [
      "[Extra Long Telescopic Pole]: Extends up to 100 inches to reach high ceilings, fans, and roof corners without a ladder.",
      "[Bendable Microfiber Head]: Easily bends to any angle to clean ceiling fan tops, air vents, and behind furniture.",
      "[Washable & Reusable]: Simply unscrew the microfiber head and rinse in warm water for like-new cleaning performance.",
      "[Scratch-Free Soft Tip]: Features a soft protective rubber tip to prevent scratching walls, light fixtures, or painted surfaces.",
      "[Space-Saving Storage]: Built-in hanging tail hole on the handle for neat storage behind doors or in closets."
    ],
    trustBadges: {
      isCodAvailable: true,
      returnPolicy: "10 Days Replacement",
      warranty: "1 Year Warranty",
      freeDelivery: true,
      topBrand: true,
      secureTransaction: true
    },
    specs: {
      "Material": "Microfiber & Stainless Steel",
      "Extended Length": "100 Inches (8.3 Feet)",
      "Head Type": "360° Bendable & Washable",
      "Color": "Sky Blue & Silver",
      "Item Weight": "320 Grams"
    },
    stock: 25,
    isFeatured: true,
    isBestseller: true,
    averageRating: 4.8,
    numReviews: 124
  },
  {
    id: 2,
    name: "Cordless Electric Spin Scrubber (8-in-1)",
    brand: "CLEANPRO",
    price: 3499,
    salePrice: 1899,
    category: "home",
    image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&auto=format&fit=crop&q=80", public_id: "prod2_1" },
      { url: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop&q=80", public_id: "prod2_2" },
      { url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80", public_id: "prod2_3" }
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    videoPosition: 2,
    description: "Rechargeable electric power spin scrubber with 8 interchangeable brush heads and adjustable extension handle for effortless bathroom and tile cleaning.",
    aboutItem: [
      "[Powerful High-Torque Motor]: Up to 450 RPM dual-speed rotation for deep cleaning bathroom tiles, grout, and bathtubs.",
      "[8 Replaceable Brush Heads]: Includes dome brush, flat brush, corner brush, sponge, and scouring pads for every surface.",
      "[Adjustable Extension Handle]: Telescopic rod extends from 25 to 54 inches to clean floors and ceilings without bending down.",
      "[IPX7 Waterproof Design]: Safe to use in wet environments like showers, sinks, kitchen countertops, and car wheels.",
      "[Fast Type-C Charging]: 2500mAh rechargeable battery delivers up to 90 minutes of continuous cleaning per charge."
    ],
    trustBadges: {
      isCodAvailable: true,
      returnPolicy: "7 Days Replacement",
      warranty: "1 Year Brand Warranty",
      freeDelivery: true,
      topBrand: true,
      secureTransaction: true
    },
    specs: {
      "Battery Capacity": "2500mAh Rechargeable",
      "Rotation Speed": "350 - 450 RPM",
      "Charging Port": "USB Type-C",
      "Brush Attachments": "8 Interchangeable Heads",
      "Waterproof Level": "IPX7 Body Waterproof"
    },
    stock: 18,
    isFeatured: true,
    isBestseller: true,
    averageRating: 4.9,
    numReviews: 215
  },
  {
    id: 3,
    name: "Multipurpose Gap Cleaning Brush Set (4-Pack)",
    brand: "HOMEGLOW",
    price: 599,
    salePrice: 299,
    category: "home",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop&q=80", public_id: "prod3_1" },
      { url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80", public_id: "prod3_2" }
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    videoPosition: 1,
    description: "Ultra-fine hard bristle crevice cleaning brushes designed to reach tight gaps, window tracks, tile lines, and kitchen faucet grooves.",
    aboutItem: [
      "[Ultra-Fine Hard Bristles]: Ultra-thin angled head effortlessly slips into narrow window tracks, tile grout, and faucet grooves.",
      "[Durable Alloy Core]: Stiff alloy-reinforced body prevents bending or snapping during heavy scrubbing.",
      "[Ergonomic Anti-Slip Grip]: Contoured handle provides comfortable control even with wet and soapy hands.",
      "[Versatile Application]: Ideal for sliding door tracks, sink corners, gas stoves, air conditioner filters, and bathroom gaps."
    ],
    trustBadges: {
      isCodAvailable: false, // Online Payment Only
      returnPolicy: "7 Days Replacement",
      warranty: "6 Months Warranty",
      freeDelivery: true,
      topBrand: false,
      secureTransaction: true
    },
    specs: {
      "Pack Size": "4 Cleaning Brushes",
      "Bristle Material": "High-Density PET Bristles",
      "Handle Material": "Reinforced ABS Plastic",
      "Color": "Matte Black & Gray"
    },
    stock: 40,
    isFeatured: true,
    isBestseller: false,
    averageRating: 4.7,
    numReviews: 88
  },
  {
    id: 4,
    name: "Self-Wringing Microfiber Flat Mop & Bucket System",
    brand: "SENVOX",
    price: 2199,
    salePrice: 1199,
    category: "home",
    image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop&q=80", public_id: "prod4_1" },
      { url: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&auto=format&fit=crop&q=80", public_id: "prod4_2" }
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    videoPosition: 2,
    description: "Hands-free squeeze flat mop with 2-chamber wash and dry bucket. Features 360-degree swivel head and ultra-absorbent reusable microfiber pads.",
    aboutItem: [
      "[Hands-Free Dual Chamber Bucket]: One groove for washing and one for wringing, keeping your hands completely clean and dry.",
      "[360° Rotatable Swivel Head]: Ultra-slim flat design glides underneath beds, sofas, cabinets, and around table legs.",
      "[Ultra-Absorbent Microfiber Pads]: Traps pet hair, liquid spills, and fine dirt effectively on hardwood, tile, and marble.",
      "[Compact & Space-Saving]: Vertical storage bucket design takes up minimal space in laundry rooms or under sinks."
    ],
    trustBadges: {
      isCodAvailable: true,
      returnPolicy: "10 Days Replacement",
      warranty: "1 Year Warranty",
      freeDelivery: true,
      topBrand: true,
      secureTransaction: true
    },
    specs: {
      "Bucket Capacity": "8 Liters Dual Chamber",
      "Mop Plate Size": "33cm x 12cm",
      "Handle Length": "128cm Stainless Steel",
      "Pads Included": "2 Reusable Microfiber Pads"
    },
    stock: 15,
    isFeatured: false,
    isBestseller: true,
    averageRating: 4.8,
    numReviews: 142
  },
  {
    id: 5,
    name: "2-in-1 Window Glass Squeegee Cleaner with Spray",
    brand: "CLEANPRO",
    price: 899,
    salePrice: 449,
    category: "home",
    image: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=800&auto=format&fit=crop&q=80", public_id: "prod5_1" },
      { url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80", public_id: "prod5_2" }
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    videoPosition: 2,
    description: "Multifunctional glass cleaning squeegee equipped with a built-in water sprayer and double-sided microfiber wiping cloth for sparkling windows.",
    aboutItem: [
      "[Integrated Spray Bottle]: Built-in water reservoir lets you spray and wipe in one seamless single-handed motion.",
      "[Streak-Free Silicone Blade]: Flexible rubber wiper blade ensures crystal-clear, streak-free window and mirror drying.",
      "[Double-Sided Microfiber Scrubber]: Removable lint-free cloth effortlessly loosens tough grime and bird droppings.",
      "[Multi-Surface Cleaning]: Perfect for car windshields, shower glass doors, high mirrors, and kitchen tile walls."
    ],
    trustBadges: {
      isCodAvailable: true,
      returnPolicy: "7 Days Replacement",
      warranty: "6 Months Warranty",
      freeDelivery: true,
      topBrand: false,
      secureTransaction: true
    },
    specs: {
      "Spray Bottle Capacity": "250ml",
      "Squeegee Width": "26 cm",
      "Cloth Type": "Machine-Washable Microfiber"
    },
    stock: 30,
    isFeatured: false,
    isBestseller: true,
    averageRating: 4.6,
    numReviews: 67
  },
  {
    id: 6,
    name: "Silicone Toilet Bowl Cleaning Brush with Holder",
    brand: "HOMEGLOW",
    price: 699,
    salePrice: 349,
    category: "home",
    image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop&q=80",
    images: [
      { url: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop&q=80", public_id: "prod6_1" },
      { url: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop&q=80", public_id: "prod6_2" }
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    videoPosition: 2,
    description: "Modern hygienic TPR silicone toilet brush with quick-drying ventilated holder and non-scratch flexible bristles.",
    aboutItem: [
      "[Flexible TPR Silicone Bristles]: Reaches deep under the rim and pipe traps without scratching porcelain ceramic glaze.",
      "[Anti-Drip Quick-Drying Base]: Ventilated hollow holder allows water to evaporate quickly, preventing bad odors.",
      "[Non-Stick & Easy to Clean]: Hair and dirt easily rinse off with tap water, keeping the brush hygienic and clean.",
      "[Wall Mount or Floor Standing]: Includes self-adhesive wall mount hook to free up bathroom floor space."
    ],
    trustBadges: {
      isCodAvailable: true,
      returnPolicy: "7 Days Replacement",
      warranty: "1 Year Warranty",
      freeDelivery: true,
      topBrand: true,
      secureTransaction: true
    },
    specs: {
      "Material": "TPR Silicone & Rustproof Aluminum",
      "Installation": "Wall-Mounted or Free-Standing",
      "Color": "White & Slate Gray"
    },
    stock: 50,
    isFeatured: true,
    isBestseller: false,
    averageRating: 4.7,
    numReviews: 95
  }
]

export default products
