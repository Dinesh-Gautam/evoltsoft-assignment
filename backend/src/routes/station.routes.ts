import { Router } from 'express'
import {
  createStation,
  getAllStations,
  getStationById,
  updateStation,
  deleteStation,
} from '../controllers/station.controller'
import { validateCreateStation, validateUpdateStation } from '../middleware/validation.middleware'
import { protectRoute } from '../middleware/auth.middleware' // Import protectRoute

/**
 * Express router for charging station API endpoints.
 * @const router
 */
const router: Router = Router()

/**
 * @route   POST /api/stations
 * @desc    Create a new charging station
 * @access  Private (Requires JWT)
 * @uses    protectRoute (middleware)
 * @uses    validateCreateStation (middleware)
 * @uses    createStation (controller)
 */
router.post('/', protectRoute, validateCreateStation, createStation)

/**
 * @route   GET /api/stations
 * @desc    Get all charging stations
 * @access  Public
 * @uses    getAllStations (controller)
 */
router.get('/', getAllStations)

/**
 * @route   GET /api/stations/:id
 * @desc    Get a specific charging station by ID
 * @access  Public
 * @uses    getStationById (controller)
 */
router.get('/:id', getStationById)

/**
 * @route   PUT /api/stations/:id
 * @desc    Update a specific charging station by ID
 * @access  Private (Requires JWT)
 * @uses    protectRoute (middleware)
 * @uses    validateUpdateStation (middleware)
 * @uses    updateStation (controller)
 */
router.put('/:id', protectRoute, validateUpdateStation, updateStation)

/**
 * @route   DELETE /api/stations/:id
 * @desc    Delete a specific charging station by ID
 * @access  Private (Requires JWT)
 * @uses    protectRoute (middleware)
 * @uses    deleteStation (controller)
 */
router.delete('/:id', protectRoute, deleteStation)

export default router
