import { Request, Response, NextFunction, RequestHandler } from 'express'
import Joi, { ObjectSchema } from 'joi'
import { IChargingStation, ILocation } from '../models/charging-station.model'

/**
 * Joi schema for validating the location object.
 * @const locationSchema
 */
const locationSchema: ObjectSchema<ILocation> = Joi.object({
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
})

/**
 * Joi schema for validating charging station creation payload.
 * @const createStationSchema
 */
const createStationSchema: ObjectSchema<IChargingStation> = Joi.object({
  name: Joi.string().trim().required(),
  location: locationSchema.required(),
  status: Joi.string().valid('Active', 'Inactive').default('Inactive').required(),
  powerOutput: Joi.number().required(),
  connectorType: Joi.string().trim().required(),
  // createdAt and updatedAt are managed by Mongoose timestamps
})

/**
 * Joi schema for validating charging station update payload.
 * Allows partial updates, so fields are optional.
 * @const updateStationSchema
 */
const updateStationSchema: ObjectSchema<Partial<IChargingStation>> = Joi.object({
  name: Joi.string().trim(),
  location: locationSchema, // Location itself can be updated, or its sub-fields
  status: Joi.string().valid('Active', 'Inactive'),
  powerOutput: Joi.number(),
  connectorType: Joi.string().trim(),
  // createdAt and updatedAt are managed by Mongoose timestamps
})

/**
 * Middleware function to validate request body against a Joi schema.
 *
 * @param {ObjectSchema} schema - The Joi schema to validate against.
 * @returns {Function} Express middleware function.
 */
export const validateRequestBody = (schema: ObjectSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })
    if (error) {
      const errors = error.details.map((detail) => ({
        message: detail.message,
        path: detail.path,
      }))
      res.status(400).json({ message: 'Validation Error', errors }) // Send response and return
      return
    }
    req.body = value // Assign validated and potentially transformed value back to req.body
    next()
  }
}

/**
 * Validation middleware for creating a charging station.
 * Uses `createStationSchema`.
 */
export const validateCreateStation = validateRequestBody(createStationSchema)

/**
 * Validation middleware for updating a charging station.
 * Uses `updateStationSchema`.
 */
export const validateUpdateStation = validateRequestBody(updateStationSchema)
