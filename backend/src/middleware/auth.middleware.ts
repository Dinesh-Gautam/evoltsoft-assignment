import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload, Secret } from 'jsonwebtoken'
import User, { IUser } from '../models/user.model' // Assuming IUser is your user interface

// Extend Express Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: IUser // User property is optional and of type IUser
    }
  }
}

/**
 * Middleware to protect routes by verifying JWT.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 */
export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token

  // 1. Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (e.g., "Bearer <token>")
      token = req.headers.authorization.split(' ')[1]

      // 2. Verify token
      const jwtSecret: Secret | undefined = process.env.JWT_SECRET
      if (!jwtSecret) {
        console.error('JWT_SECRET not defined in environment variables.')
        res.status(500).json({ message: 'Server configuration error: JWT secret missing.' })
        return
      }

      const decoded = jwt.verify(token, jwtSecret) as JwtPayload

      // 3. Get user from the token payload (ID) and attach to request
      //    Exclude password when fetching user
      const user = await User.findById(decoded.id).select('-password')

      if (!user) {
        res.status(401).json({ message: 'Not authorized, user not found for this token.' })
        return
      }

      req.user = user // Attach user to request object
      next() // Proceed to the next middleware or route handler
    } catch (error) {
      console.error('Token verification failed:', error)
      res.status(401).json({ message: 'Not authorized, token failed or expired.' })
    }
  } else {
    // No token found in header
    res.status(401).json({ message: 'Not authorized, no token provided.' })
  }
}
