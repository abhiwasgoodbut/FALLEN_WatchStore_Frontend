import { createContext, useContext, useReducer } from 'react'

const WishlistContext = createContext()

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_WISHLIST': {
      const exists = state.items.find(item => item.id === action.payload.id)
      if (exists) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id)
        }
      }
      return {
        ...state,
        items: [...state.items, action.payload]
      }
    }
    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      }
    default:
      return state
  }
}

export function WishlistProvider({ children }) {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] })

  const toggleWishlist = (product) => dispatch({ type: 'TOGGLE_WISHLIST', payload: product })
  const removeFromWishlist = (id) => dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: id })
  const isInWishlist = (id) => state.items.some(item => item.id === id)

  const wishlistCount = state.items.length

  return (
    <WishlistContext.Provider value={{
      wishlistItems: state.items,
      wishlistCount,
      toggleWishlist,
      removeFromWishlist,
      isInWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within WishlistProvider')
  return context
}
