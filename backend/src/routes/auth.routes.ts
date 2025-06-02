import express from 'express'
import { registerUser, loginUser } from '../controllers/auth.controller'
import { validateRequestBody } from '../middleware/validation.middleware' // Assuming you have this from previous tasks
import Joi from 'joi'

const router = express.Router()

/**
 * Joi schema for user registration - used by validation.middleware
 */
const registerSchemaValidation = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
})

/**
 * Joi schema for user login - used by validation.middleware
 */
const loginSchemaValidation = Joi.object({
  login: Joi.string().required(), // Can be username or email
  password: Joi.string().required(),
})

// --- Authentication Routes ---

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  validateRequestBody(registerSchemaValidation), // Apply Joi validation middleware
  registerUser
)

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post(
  '/login',
  validateRequestBody(loginSchemaValidation), // Apply Joi validation middleware
  loginUser
)

export default router
