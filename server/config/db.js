import dns from 'node:dns'
import mongoose from 'mongoose'

// Only set custom DNS on Windows locally if needed for Atlas SRV resolution
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1'])
  } catch (e) {
    // Ignore
  }
}

let cachedConnection = null
let lastConnectionError = null

export const getLastConnectionError = () => lastConnectionError

const connectDB = async () => {
  // Reuse existing connection if already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  if (!process.env.MONGO_URI) {
    lastConnectionError = 'MONGO_URI is missing from environment variables'
    console.error('❌ ' + lastConnectionError)
    return null
  }

  try {
    // If not on win32, do not mess with DNS unless needed, but let's configure standard options
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    })
    cachedConnection = conn
    lastConnectionError = null
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    lastConnectionError = error.message
    console.error(`❌ MongoDB Connection Error: ${error.message}`)
    return null
  }
}

export default connectDB
