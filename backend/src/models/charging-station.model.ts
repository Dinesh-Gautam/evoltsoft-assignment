import mongoose, { Schema, Document } from "mongoose";

/**
 * Interface representing the location of a charging station.
 * @interface ILocation
 */
export interface ILocation {
  latitude: number;
  longitude: number;
}

/**
 * Interface representing a Charging Station document in MongoDB.
 * @interface IChargingStation
 * @extends {Document}
 */
export interface IChargingStation extends Document {
  /**
   * The name of the charging station.
   * @type {string}
   * @required
   */
  name: string;

  /**
   * The geographical location of the charging station.
   * @type {ILocation}
   * @required
   */
  location: ILocation;

  /**
   * The operational status of the charging station.
   * @type {'Active' | 'Inactive'}
   * @required
   * @default 'Inactive'
   */
  status: "Active" | "Inactive";

  /**
   * The power output of the charging station in kilowatts (kW).
   * @type {number}
   * @required
   */
  powerOutput: number;

  /**
   * The type of connector available at the charging station.
   * @type {string}
   * @required
   * @example 'Type 2', 'CCS', 'CHAdeMO'
   */
  connectorType: string;

  /**
   * Timestamp of when the document was created.
   * @type {Date}
   * @readonly
   */
  createdAt?: Date;

  /**
   * Timestamp of when the document was last updated.
   * @type {Date}
   * @readonly
   */
  updatedAt?: Date;
}

/**
 * Mongoose schema for the ChargingStation model.
 * @const ChargingStationSchema
 */
const ChargingStationSchema: Schema<IChargingStation> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      required: true,
      default: "Inactive",
    },
    powerOutput: {
      type: Number,
      required: true,
    },
    connectorType: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

/**
 * Mongoose model for Charging Stations.
 * @const ChargingStation
 * @type {mongoose.Model<IChargingStation>}
 */
const ChargingStation = mongoose.model<IChargingStation>(
  "ChargingStation",
  ChargingStationSchema
);

export default ChargingStation;
