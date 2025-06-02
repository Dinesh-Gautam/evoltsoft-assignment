import { Request, Response } from 'express'
import Joi from 'joi'
import jwt, { SignOptions } from 'jsonwebtoken'
import { Types } from 'mongoose'
import User from '../models/user.model'

// --- Validation Schemas ---

/**
 * Joi schema for user registration.
 */
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    'string.base': 'Username should be a type of text',
    'string.alphanum': 'Username must only contain alpha-numeric characters',
    'string.empty': 'Username cannot be an empty field',
    'string.min': 'Username should have a minimum length of {#limit}',
    'string.max': 'Username should have a maximum length of {#limit}',
    'any.required': 'Username is a required field',
  }),
  email: Joi.string().email().required().messages({
    'string.base': 'Email should be a type of text',
    'string.email': 'Email must be a valid email address',
    'string.empty': 'Email cannot be an empty field',
    'any.required': 'Email is a required field',
  }),
  password: Joi.string().min(6).required().messages({
    'string.base': 'Password should be a type of text',
    'string.empty': 'Password cannot be an empty field',
    'string.min': 'Password should have a minimum length of {#limit}',
    'any.required': 'Password is a required field',
  }),
})

/**
 * Joi schema for user login.
 * Allows login with either username or email.
 */
const loginSchema = Joi.object({
  login: Joi.string().required().messages({
    // Can be username or email
    'string.base': 'Login identifier should be a type of text',
    'string.empty': 'Login identifier cannot be an empty field',
    'any.required': 'Login identifier (username or email) is a required field',
  }),
  password: Joi.string().required().messages({
    'string.base': 'Password should be a type of text',
    'string.empty': 'Password cannot be an empty field',
    'any.required': 'Password is a required field',
  }),
})

// --- Helper Function to Generate JWT ---
/**
 * Generates a JWT for a given user.
 * @param userId - The ID of the user.
 * @returns The generated JWT.
 */
const generateToken = (userId: Types.ObjectId): string => {
  const secret = process.env.JWT_SECRET
  const expiresInRaw = process.env.JWT_EXPIRES_IN

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables.')
  }
  // Ensure expiresInRaw is a non-empty string and valid
  if (!expiresInRaw || typeof expiresInRaw !== 'string' || expiresInRaw.trim() === '') {
    throw new Error(
      'JWT_EXPIRES_IN is not defined, is not a string, or is empty in environment variables.'
    )
  }
  const expiresIn = expiresInRaw

  const payload = {
    id: userId.toString(), // Use toString() for ObjectId
  }

  const options: SignOptions = {
    // Explicitly type options
    expiresIn: expiresIn as any,
    algorithm: 'HS256', // Explicitly set algorithm
  }

  return jwt.sign(payload, secret, options)
}

// --- Controller Functions ---

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Validate input
    const { error, value } = registerSchema.validate(req.body, {
      abortEarly: false,
    })
    if (error) {
      const errors = error.details.map((detail) => detail.message)
      res.status(400).json({ message: 'Validation failed', errors })
      return
    }

    const { username, email, password } = value

    // 2. Check if user already exists (by username or email)
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username'
      res.status(409).json({ message: `${field} already exists.` })
      return
    }

    // 3. Create new user (password will be hashed by pre-save hook)
    const newUser = new User({
      username,
      email,
      password, // Pass plain password, model will hash it
    })

    await newUser.save()

    // 4. Respond with user details (excluding password - handled by toJSON in model)
    //    and a JWT for immediate login (optional, but good UX)
    const token = generateToken(newUser._id as Types.ObjectId)

    res.status(201).json({
      message: 'User registered successfully.',
      user: newUser.toJSON(), // toJSON will remove password
      token,
    })
  } catch (err) {
    console.error('Error during user registration:', err)
    // Check for Mongoose validation errors specifically if not caught by Joi
    if (err instanceof Error && err.name === 'ValidationError') {
      const messages = Object.values((err as any).errors).map((e: any) => e.message)
      res.status(400).json({ message: 'Validation failed', errors: messages })
      return
    }
    res.status(500).json({ message: 'Server error during registration.' })
  }
}

/**
 * @desc Authenticate a user and get token
 * @route POST /api/auth/login
 * @access Public
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Validate input
    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false,
    })
    if (error) {
      const errors = error.details.map((detail) => detail.message)
      res.status(400).json({ message: 'Validation failed', errors })
      return
    }

    const { login, password: candidatePassword } = value

    // 2. Find user by email or username
    //    And explicitly select the password field as it's excluded by default
    const user = await User.findOne({
      $or: [{ email: login.toLowerCase() }, { username: login.toLowerCase() }],
    }).select('+password')

    if (!user) {
      res.status(400).json({ message: 'Invalid credentials. User not found.' })
      return
    }

    // 3. Compare password
    //    The user.password will be available here due to .select('+password')
    const isMatch = await user.comparePassword(candidatePassword)

    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials. Password incorrect.' })
      return
    }

    // 4. If passwords match, generate a JWT
    const token = generateToken(user._id as Types.ObjectId)

    // 5. Respond with the JWT and user details (excluding password)
    res.status(200).json({
      message: 'Login successful.',
      token,
      user: user.toJSON(), // toJSON will remove password
    })
  } catch (err) {
    console.error('Error during user login:', err)
    res.status(500).json({ message: 'Server error during login.' })
  }
}
