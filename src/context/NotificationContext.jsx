import { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext()

let idCounter = 0

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++idCounter
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, duration)
  }, [])

  const notify = {
    success: (msg) => addNotification(msg, 'success'),
    error: (msg) => addNotification(msg, 'error'),
    info: (msg) => addNotification(msg, 'info'),
    warning: (msg) => addNotification(msg, 'warning'),
  }

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      {/* Toast Container */}
      <div className="toast-container">
        {notifications.map(n => (
          <div key={n.id} className={`toast toast--${n.type}`}>
            <span className="toast__icon">
              {n.type === 'success' && '✓'}
              {n.type === 'error' && '✕'}
              {n.type === 'info' && 'ℹ'}
              {n.type === 'warning' && '⚠'}
            </span>
            <span className="toast__message">{n.message}</span>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotification must be used within NotificationProvider')
  return context
}
