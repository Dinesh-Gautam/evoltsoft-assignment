import { Request, Response } from 'express'
import ChargingStation, { IChargingStation } from '../models/charging-station.model'

/**
 * Creates a new charging station.
 * @async
 * @function createStation
 * @param {Request} req - Express request object. Expected body: IChargingStation.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the created station or an error message.
 */
export const createStation = async (req: Request, res: Response): Promise<void> => {
  try {
    const stationData: IChargingStation = req.body
    const newStation = new ChargingStation(stationData)
    await newStation.save()
    res.status(201).json(newStation)
  } catch (error: any) {
    res.status(400).json({ message: 'Error creating station', error: error.message })
  }
}

/**
 * Retrieves all charging stations.
 * @async
 * @function getAllStations
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with all stations or an error message.
 */
export const getAllStations = async (req: Request, res: Response): Promise<void> => {
  try {
    const stations = await ChargingStation.find()
    res.status(200).json(stations)
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching stations', error: error.message })
  }
}

/**
 * Retrieves a single charging station by its ID.
 * @async
 * @function getStationById
 * @param {Request} req - Express request object. Expects `id` in params.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the station or an error message if not found.
 */
export const getStationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const station = await ChargingStation.findById(req.params.id)
    if (!station) {
      res.status(404).json({ message: 'Station not found' })
      return
    }
    res.status(200).json(station)
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching station', error: error.message })
  }
}

/**
 * Updates an existing charging station by its ID.
 * @async
 * @function updateStation
 * @param {Request} req - Express request object. Expects `id` in params and updated station data in body.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the updated station or an error message.
 */
export const updateStation = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedStation = await ChargingStation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!updatedStation) {
      res.status(404).json({ message: 'Station not found' })
      return
    }
    res.status(200).json(updatedStation)
  } catch (error: any) {
    res.status(400).json({ message: 'Error updating station', error: error.message })
  }
}

/**
 * Deletes a charging station by its ID.
 * @async
 * @function deleteStation
 * @param {Request} req - Express request object. Expects `id` in params.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response confirming deletion or an error message.
 */
export const deleteStation = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedStation = await ChargingStation.findByIdAndDelete(req.params.id)
    if (!deletedStation) {
      res.status(404).json({ message: 'Station not found' })
      return
    }
    res.status(200).json({ message: 'Station deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting station', error: error.message })
  }
}
