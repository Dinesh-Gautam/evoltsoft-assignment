export interface Location {
  latitude: number
  longitude: number
}

type ConnectorType = 'Type1' | 'Type2' | 'CCS' | 'CHAdeMO' | 'Tesla' | 'Other'
type StatusType = 'Active' | 'Inactive'

export interface ChargingStation {
  _id?: string
  name: string
  location: Location
  status: StatusType
  powerOutput: number // in kW
  connectorType: ConnectorType
  createdAt?: Date
  updatedAt?: Date
}

export interface ChargingStationForm {
  name: string | undefined
  latitude: number | undefined
  longitude: number | undefined
  status: StatusType | undefined
  powerOutput: number | undefined
  connectorType: ConnectorType | undefined
}

export interface ChargingStationFilters {
  status: StatusType | null
  powerOutput: number | null
  connectorType: ConnectorType | null
}
