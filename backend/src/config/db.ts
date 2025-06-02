import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config() // Ensure environment variables are loaded

/**
 * Connects to the MongoDB database.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>} A promise that resolves when the connection is successful.
 * @throws {Error} If the MONGODB_URI environment variable is not set or if the connection fails.
 */
const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI
    if (!mongoURI) {
      console.error('Error: MONGODB_URI is not defined in environment variables.')
      process.exit(1)
    }

    await mongoose.connect(mongoURI)
    console.log('MongoDB Connected...')
  } catch (err: any) {
    console.error('MongoDB connection error:', err.message)
    // Exit process with failure
    process.exit(1)
  }
}

export default connectDB
