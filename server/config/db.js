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

let lastConnectionError = null
let connectionPromise = null

export const getLastConnectionError = () => lastConnectionError

const getCleanMongoUri = () => {
  let uri = (process.env.MONGO_URI || '').trim()
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1).trim()
  }
  return uri
}

export const getMaskedMongoUri = () => {
  const uri = getCleanMongoUri()
  if (!uri) return 'MISSING'
  return uri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@')
}

const connectDB = async () => {
  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  // If currently connecting, wait for the pending promise
  if (mongoose.connection.readyState === 2 && connectionPromise) {
    try {
      await connectionPromise
      return mongoose.connection
    } catch (err) {
      // Fall through to retry
    }
  }

  const uri = getCleanMongoUri()
  if (!uri) {
    lastConnectionError = 'MONGO_URI is missing or empty'
    console.error('❌ ' + lastConnectionError)
    return null
  }

  try {
    console.log(`Connecting to MongoDB (${getMaskedMongoUri()})...`)
    connectionPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 7000,
      connectTimeoutMS: 7000,
    })
    await connectionPromise
    lastConnectionError = null
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`)
    return mongoose.connection
  } catch (error) {
    connectionPromise = null
    lastConnectionError = error.message
    console.error(`❌ MongoDB Connection Error: ${error.message}`)
    return null
  }
}

export default connectDB
