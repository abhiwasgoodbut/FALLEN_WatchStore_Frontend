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

const connectDB = async () => {
  // Reuse existing connection if already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  if (cachedConnection) {
    return cachedConnection
  }

  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is missing from environment variables!')
    return null
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    })
    cachedConnection = conn
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`)
    // Do not call process.exit(1) in serverless as it causes 500 FUNCTION_INVOCATION_FAILED
    return null
  }
}

export default connectDB
