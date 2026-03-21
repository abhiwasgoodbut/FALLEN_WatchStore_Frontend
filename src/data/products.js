const products = [
  {
    id: 1,
    name: "Royal Oak Chronograph",
    brand: "AUDEMARS PIGUET",
    price: 185000,
    salePrice: 149999,
    category: "luxury",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500",
    description: "A masterpiece of haute horlogerie, the Royal Oak Chronograph features a stunning stainless steel case with the iconic octagonal bezel. This timepiece combines sporty elegance with exceptional craftsmanship.",
    specs: {
      "Movement": "Automatic",
      "Case Size": "41mm",
      "Water Resistance": "50m",
      "Material": "Stainless Steel",
      "Crystal": "Sapphire"
    },
    isFeatured: true,
    isBestseller: true
  },
  {
    id: 2,
    name: "Submariner Date",
    brand: "ROLEX",
    price: 245000,
    salePrice: 199999,
    category: "luxury",
    image: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=500",
    description: "The Submariner Date is the quintessential diver's watch. A reference among divers' watches, this model features a unidirectional rotatable bezel and luminescent display.",
    specs: {
      "Movement": "Automatic",
      "Case Size": "41mm",
      "Water Resistance": "300m",
      "Material": "Oystersteel",
      "Crystal": "Sapphire"
    },
    isFeatured: true,
    isBestseller: true
  },
  {
    id: 3,
    name: "Speedmaster Moonwatch",
    brand: "OMEGA",
    price: 165000,
    salePrice: 139999,
    category: "classic",
    image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500",
    description: "The legendary Moonwatch that accompanied astronauts on their journey to the moon. An icon of space exploration and precision engineering.",
    specs: {
      "Movement": "Manual",
      "Case Size": "42mm",
      "Water Resistance": "50m",
      "Material": "Stainless Steel",
      "Crystal": "Hesalite"
    },
    isFeatured: true,
    isBestseller: false
  },
  {
    id: 4,
    name: "Big Bang Unico",
    brand: "HUBLOT",
    price: 325000,
    salePrice: 279999,
    category: "luxury",
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=500",
    description: "Bold and innovative, the Big Bang Unico embodies Hublot's Art of Fusion philosophy. A dramatic timepiece with an in-house movement visible through the skeleton dial.",
    specs: {
      "Movement": "Automatic",
      "Case Size": "44mm",
      "Water Resistance": "100m",
      "Material": "Titanium",
      "Crystal": "Sapphire"
    },
    isFeatured: true,
    isBestseller: false
  },
  {
    id: 5,
    name: "Navitimer B01",
    brand: "BREITLING",
    price: 135000,
    salePrice: 114999,
    category: "classic",
    image: "https://images.unsplash.com/photo-1622434641406-a158123450f9?w=500",
    description: "An iconic pilot's watch with the legendary circular slide rule bezel. The Navitimer is the ultimate instrument for aviation enthusiasts and watch collectors alike.",
    specs: {
      "Movement": "Automatic",
      "Case Size": "43mm",
      "Water Resistance": "30m",
      "Material": "Stainless Steel",
      "Crystal": "Sapphire"
    },
    isFeatured: false,
    isBestseller: true
  },
  {
    id: 6,
    name: "Carrera Chronograph",
    brand: "TAG HEUER",
    price: 95000,
    salePrice: 79999,
    category: "sport",
    image: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=500",
    description: "Born on the racetrack, the Carrera is a legendarily sporty chronograph. Clean lines and bold design make it the perfect companion for those who live life at full speed.",
    specs: {
      "Movement": "Automatic",
      "Case Size": "44mm",
      "Water Resistance": "100m",
      "Material": "Stainless Steel",
      "Crystal": "Sapphire"
    },
    isFeatured: false,
    isBestseller: true
  },
  {
    id: 7,
    name: "Portugieser Chronograph",
    brand: "IWC",
    price: 175000,
    salePrice: 149999,
    category: "classic",
    image: "https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=500",
    description: "The Portugieser Chronograph stands for pure elegance with its clear dial and timeless design. A watch that transcends trends and remains forever stylish.",
    specs: {
      "Movement": "Automatic",
      "Case Size": "41mm",
      "Water Resistance": "30m",
      "Material": "Stainless Steel",
      "Crystal": "Sapphire"
    },
    isFeatured: true,
    isBestseller: false
  },
  {
    id: 8,
    name: "Santos de Cartier",
    brand: "CARTIER",
    price: 195000,
    salePrice: 169999,
    category: "luxury",
    image: "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=500",
    description: "First designed in 1904 for aviator Alberto Santos-Dumont, this is one of the first wristwatches ever made. Timeless design meets modern innovation.",
    specs: {
      "Movement": "Automatic",
      "Case Size": "39.8mm",
      "Water Resistance": "100m",
      "Material": "Stainless Steel & Gold",
      "Crystal": "Sapphire"
    },
    isFeatured: true,
    isBestseller: true
  },
  {
    id: 9,
    name: "G-Shock MR-G",
    brand: "CASIO",
    price: 45000,
    salePrice: 38999,
    category: "sport",
    image: "https://images.unsplash.com/photo-1517945929820-1407bbfa129f?w=500",
    description: "The ultimate G-Shock, crafted from titanium and built to withstand anything. Combining G-Shock's legendary toughness with premium materials.",
    specs: {
      "Movement": "Quartz (Tough Solar)",
      "Case Size": "49.8mm",
      "Water Resistance": "200m",
      "Material": "Titanium",
      "Crystal": "Sapphire"
    },
    isFeatured: false,
    isBestseller: true
  },
  {
    id: 10,
    name: "Luminor Marina",
    brand: "PANERAI",
    price: 155000,
    salePrice: 134999,
    category: "sport",
    image: "https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=500",
    description: "Originally created for the Italian Navy, the Luminor Marina is an icon of Italian design. Its patented crown-protecting bridge device is instantly recognizable.",
    specs: {
      "Movement": "Automatic",
      "Case Size": "44mm",
      "Water Resistance": "300m",
      "Material": "Stainless Steel",
      "Crystal": "Sapphire"
    },
    isFeatured: false,
    isBestseller: false
  },
  {
    id: 11,
    name: "Aqua Terra 150M",
    brand: "OMEGA",
    price: 125000,
    salePrice: 109999,
    category: "classic",
    image: "https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=500",
    description: "The Aqua Terra bridges the gap between elegant dress watch and robust sports watch. Its teak-pattern dial is inspired by the wooden decks of luxury sailing yachts.",
    specs: {
      "Movement": "Automatic (Co-Axial)",
      "Case Size": "41mm",
      "Water Resistance": "150m",
      "Material": "Stainless Steel",
      "Crystal": "Sapphire"
    },
    isFeatured: true,
    isBestseller: false
  },
  {
    id: 12,
    name: "PRX Powermatic 80",
    brand: "TISSOT",
    price: 42000,
    salePrice: 35999,
    category: "classic",
    image: "https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=500",
    description: "A modern classic with retro DNA, the PRX combines 1970s integrated bracelet design with a contemporary proportioned case. Exceptional value in Swiss watchmaking.",
    specs: {
      "Movement": "Automatic",
      "Case Size": "40mm",
      "Water Resistance": "100m",
      "Material": "Stainless Steel",
      "Crystal": "Sapphire"
    },
    isFeatured: false,
    isBestseller: true
  },
  {
    id: 13,
    name: "Prospex Diver",
    brand: "SEIKO",
    price: 38000,
    salePrice: 32999,
    category: "sport",
    image: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=500",
    description: "Built for professional divers, the Prospex range represents Seiko's commitment to functionality. Exceptional build quality and water resistance at an incredible value.",
    specs: {
      "Movement": "Automatic",
      "Case Size": "45mm",
      "Water Resistance": "200m",
      "Material": "Stainless Steel",
      "Crystal": "Hardlex"
    },
    isFeatured: false,
    isBestseller: false
  },
  {
    id: 14,
    name: "Khaki Field Mechanical",
    brand: "HAMILTON",
    price: 52000,
    salePrice: 44999,
    category: "classic",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500",
    description: "Rooted in military heritage, the Khaki Field is the definitive field watch. Clean, legible, and built tough — it's an everyday essential for the modern adventurer.",
    specs: {
      "Movement": "Manual",
      "Case Size": "38mm",
      "Water Resistance": "50m",
      "Material": "Stainless Steel",
      "Crystal": "Sapphire"
    },
    isFeatured: false,
    isBestseller: false
  },
  {
    id: 15,
    name: "Galaxy Watch Ultra",
    brand: "SAMSUNG",
    price: 59999,
    salePrice: 52999,
    category: "smart",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500",
    description: "The most advanced smartwatch for the adventurous spirit. Track your fitness, monitor your health, and stay connected with premium build quality.",
    specs: {
      "Movement": "Digital",
      "Case Size": "47mm",
      "Water Resistance": "100m (10ATM)",
      "Material": "Titanium Grade 4",
      "Display": "Super AMOLED"
    },
    isFeatured: false,
    isBestseller: true
  },
  {
    id: 16,
    name: "Apple Watch Ultra 2",
    brand: "APPLE",
    price: 89999,
    salePrice: 84999,
    category: "smart",
    image: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=500",
    description: "Designed for the most extreme environments and athletes. The ultimate smartwatch with precision GPS, health sensors, and an incredibly bright display.",
    specs: {
      "Movement": "Digital",
      "Case Size": "49mm",
      "Water Resistance": "100m (WR100)",
      "Material": "Titanium",
      "Display": "OLED Always-On Retina"
    },
    isFeatured: true,
    isBestseller: true
  }
]

export default products
