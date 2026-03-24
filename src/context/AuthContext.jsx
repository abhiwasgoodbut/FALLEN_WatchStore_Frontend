import { createContext, useContext, useState, useEffect } from 'react'
import API from '../api/axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem('fallen_user') || 'null')
  })
  const [loading, setLoading] = useState(false)

  // Sync to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('fallen_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('fallen_user')
    }
  }, [user])

  // Refresh user profile from server on mount (picks up role changes etc.)
  useEffect(() => {
    if (user?.token) {
      API.get('/auth/profile')
        .then(({ data }) => {
          setUser(prev => ({ ...prev, ...data, token: prev.token }))
        })
        .catch(() => { /* token expired or server down — keep local data */ })
    }
  }, []) // only on mount

  const login = async (email, password) => {
    setLoading(true)
    try {
      const { data } = await API.post('/auth/login', { email, password })
      setUser(data)
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const register = async (formData) => {
    setLoading(true)
    try {
      const { data } = await API.post('/auth/register', formData)
      setUser(data)
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' }
    } finally {
      setLoading(false)
    }
  }

  const googleLogin = async (credential) => {
    setLoading(true)
    try {
      const { data } = await API.post('/auth/google', { credential })
      setUser(data)
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Google Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('fallen_user')
  }

  const updateProfile = async (profileData) => {
    try {
      const { data } = await API.put('/auth/profile', profileData)
      setUser(prev => ({ ...prev, ...data }))
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Update failed' }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login,
      googleLogin,
      register,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
