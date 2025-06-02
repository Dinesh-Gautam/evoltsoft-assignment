import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import cors from 'cors' // Import cors
import connectDB from './config/db' // Import the DB connection function
import stationRoutes from './routes/station.routes' // Import station routes
import authRoutes from './routes/auth.routes' // Import auth routes

dotenv.config()

connectDB()

const app: Express = express()

const corsOptions = {
  origin: process.env.APP_URL, // allow only your frontend origin
  optionsSuccessStatus: 200, // for legacy browser support
}

app.use(cors(corsOptions))

app.use(express.json())
const port = process.env.PORT || 3000

/**
 * @route GET /
 * @description Root endpoint for the backend API.
 * @returns {object} 200 - JSON object with a success message.
 */
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Backend API is running' })
})

// API Routes
app.use('/api/auth', authRoutes) // Use auth routes
app.use('/api/stations', stationRoutes)

/**
 * Starts the Express server and listens on the specified port.
 */
const startServer = () => {
  try {
    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`)
    })
  } catch (error) {
    console.error('[server]: Error starting server:', error)
    process.exit(1)
  }
}

startServer()

export default app
