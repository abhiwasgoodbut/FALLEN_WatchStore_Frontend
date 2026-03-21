# FALLEN — Premium Watch Store

A modern, premium e-commerce frontend for luxury watches built with **React** and **Vite**. Designed with rich aesthetics, smooth animations, and a fully responsive layout.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-Private-red)

---

## ✨ Features

- **Beautiful UI** — Dark & gold luxury theme with glassmorphism, smooth gradients, and micro-animations
- **Fully Responsive** — Optimized for desktop, tablet, and mobile devices
- **Product Catalog** — Browse 16+ premium watches from brands like Rolex, Omega, Hublot, Cartier, and more
- **Product Detail Pages** — Detailed specs, image gallery, and add-to-cart functionality
- **Shopping Cart** — Add, remove, and manage quantities with a real-time cart summary
- **Wishlist** — Save favorite watches for later
- **Search** — Full-screen search overlay with live product filtering
- **Category Filtering** — Filter by Luxury, Classic, Sport, and Smart categories
- **Sort Options** — Sort products by price, name, or default order
- **Track Order** — Order tracking page (frontend-ready)
- **Contact Page** — Contact form with company information cards
- **About Page** — Brand story, values, and mission
- **Authentication** — Login & Register pages with back navigation
- **Announcement Bar** — Auto-scrolling ticker for promotions
- **Back to Top** — Smooth scroll-to-top button

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI library |
| **React Router DOM 6** | Client-side routing |
| **React Icons** | Icon library (Feather Icons) |
| **Vite 6** | Build tool & dev server |
| **Vanilla CSS** | Custom design system with CSS variables |
| **Google Fonts** | Playfair Display + Inter typography |

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AnnouncementBar.jsx
│   ├── BackToTop.jsx
│   ├── Footer.jsx
│   ├── Layout.jsx
│   ├── Navbar.jsx
│   └── ProductCard.jsx
├── context/             # React Context for global state
│   ├── CartContext.jsx
│   └── WishlistContext.jsx
├── data/
│   └── products.js      # Product catalog (16 watches)
├── pages/               # Route-level page components
│   ├── AboutPage.jsx
│   ├── CartPage.jsx
│   ├── ContactPage.jsx
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── ProductDetailPage.jsx
│   ├── RegisterPage.jsx
│   ├── ShopPage.jsx
│   ├── TrackOrderPage.jsx
│   └── WishlistPage.jsx
├── App.jsx              # Route definitions
├── index.css            # Complete design system & styles
└── main.jsx             # App entry point
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ recommended
- **npm** v9+

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd Bussiness

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview    # Preview the production build
```

---

## 🗺️ Routes

| Route | Page | Description |
|---|---|---|
| `/` | Home | Hero, featured products, categories, newsletter |
| `/shop` | Shop | Full product catalog with filters & sorting |
| `/product/:id` | Product Detail | Individual product page with specs |
| `/cart` | Cart | Shopping cart with summary |
| `/wishlist` | Wishlist | Saved products |
| `/track-order` | Track Order | Order tracking form |
| `/contact` | Contact | Contact form & info |
| `/about` | About | Brand story & values |
| `/login` | Login | User sign-in |
| `/register` | Register | User sign-up |

---

## 🎨 Design System

The app uses a custom CSS design system defined via CSS variables in `index.css`:

- **Colors** — Black, gold, and off-white luxury palette
- **Typography** — Playfair Display (headings) + Inter (body)
- **Spacing** — 8-point spacing scale (`xs` to `4xl`)
- **Shadows** — 4-level shadow scale (`sm`, `md`, `lg`, `xl`)
- **Transitions** — `fast` (0.2s), `base` (0.3s), `slow` (0.5s)

---

## 📝 Notes

- This is a **frontend-only** project. Authentication and order tracking are UI-ready but not connected to a backend.
- Product data is stored in `src/data/products.js` as static data.
- Cart and Wishlist state is managed via React Context (not persisted across sessions).

---

## 📄 License

This project is **private** and not licensed for public distribution.
