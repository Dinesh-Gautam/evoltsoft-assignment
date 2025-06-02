import api from '@/services/api'
import type { ChargingStation, ChargingStationFilters, Location } from '@/types/charger.types'
import { defineStore } from 'pinia'

interface FieldError {
  message: string
  path: string[]
}

interface ChargerState {
  chargers: ChargingStation[]
  selectedCharger: ChargingStation | null
  loading: boolean
  error: string | null
  fieldErrors: Record<string, string> | null
  filters: ChargingStationFilters
}

export const useChargerStore = defineStore('charger', {
  state: (): ChargerState => ({
    chargers: [],
    selectedCharger: null,
    loading: false,
    error: null,
    fieldErrors: null,
    filters: {
      status: null,
      powerOutput: null,
      connectorType: null,
    },
  }),
  getters: {
    filteredChargers(state): ChargingStation[] {
      return state.chargers.filter((charger) => {
        const statusMatch = state.filters.status ? charger.status === state.filters.status : true

        const powerOutputMatch = state.filters.powerOutput
          ? charger.powerOutput >= state.filters.powerOutput
          : true

        const connectorTypeMatch = state.filters.connectorType
          ? charger.connectorType === state.filters.connectorType
          : true

        return statusMatch && powerOutputMatch && connectorTypeMatch
      })
    },
  },
  actions: {
    async fetchChargers(currentFilters?: Partial<ChargerState['filters']>) {
      this.loading = true
      this.error = null
      this.fieldErrors = null

      try {
        let url = '/api/stations'

        if (currentFilters) {
          const params = new URLSearchParams()

          if (currentFilters.status) {
            params.append('status', currentFilters.status)
          }

          if (currentFilters.powerOutput !== null && currentFilters.powerOutput !== undefined) {
            params.append('powerOutput', String(currentFilters.powerOutput))
          }

          if (currentFilters.connectorType) {
            params.append('connectorType', currentFilters.connectorType)
          }

          const queryString = params.toString()

          if (queryString) {
            url += `?${queryString}`
          }
        }

        const response = await api.get<ChargingStation[]>(url)
        this.chargers = response.data
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message || 'Failed to fetch chargers'
        this.chargers = []
      } finally {
        this.loading = false
      }
    },
    async createCharger(
      stationData: Omit<ChargingStation, '_id' | 'createdAt' | 'updatedAt' | 'location'> & {
        location: Location
      },
    ) {
      this.loading = true
      this.error = null
      this.fieldErrors = null

      try {
        const response = await api.post<ChargingStation>('/api/stations', stationData)

        await this.fetchChargers() // Refetch

        return response.data
      } catch (err: any) {
        if (err.response && err.response.data) {
          this.error = err.response.data.message || 'Failed to create charger.'

          if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
            const fieldErrorsData: Record<string, string> = {}

            err.response.data.errors.forEach((fieldError: FieldError) => {
              if (fieldError.path && fieldError.path.length > 0) {
                // Handle nested paths like 'location.latitude'
                const pathKey = fieldError.path.join('.')
                fieldErrorsData[pathKey] = fieldError.message
              }
            })

            this.fieldErrors = fieldErrorsData
          }
        } else {
          this.error = err.message || 'Failed to create charger. Please try again.'
        }

        throw err
      } finally {
        this.loading = false
      }
    },
    async updateCharger(
      stationId: string,
      stationData: Partial<
        Omit<ChargingStation, '_id' | 'createdAt' | 'updatedAt' | 'location'> & {
          location: Location
        }
      >,
    ) {
      this.loading = true
      this.error = null
      this.fieldErrors = null

      try {
        const response = await api.put<ChargingStation>(`/api/stations/${stationId}`, stationData)

        await this.fetchChargers() // Refetch

        return response.data
      } catch (err: any) {
        if (err.response && err.response.data) {
          this.error = err.response.data.message || 'Failed to update charger.'

          if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
            const fieldErrorsData: Record<string, string> = {}

            err.response.data.errors.forEach((fieldError: FieldError) => {
              if (fieldError.path && fieldError.path.length > 0) {
                const pathKey = fieldError.path.join('.')
                fieldErrorsData[pathKey] = fieldError.message
              }
            })

            this.fieldErrors = fieldErrorsData
          }
        } else {
          this.error = err.message || 'Failed to update charger. Please try again.'
        }
        throw err
      } finally {
        this.loading = false
      }
    },
    async deleteCharger(stationId: string) {
      this.loading = true
      this.error = null
      this.fieldErrors = null // Also clear field errors here

      try {
        await api.delete(`/api/stations/${stationId}`)

        this.chargers = this.chargers.filter((c) => c._id !== stationId)
      } catch (err: any) {
        this.error = err.response?.data?.message || err.message || 'Failed to delete charger'
        throw err
      } finally {
        this.loading = false
      }
    },
    async fetchChargerById(stationId: string) {
      this.loading = true
      this.error = null
      this.fieldErrors = null
      try {
        const response = await api.get<ChargingStation>(`/api/stations/${stationId}`)

        this.selectedCharger = response.data

        const index = this.chargers.findIndex((c) => c._id === stationId)

        if (index !== -1) {
          this.chargers[index] = response.data
        } else {
          this.chargers.push(response.data) // Add if not present, though this might not be desired always
        }

        return response.data
      } catch (err: any) {
        this.error =
          err.response?.data?.message || err.message || `Failed to fetch charger ${stationId}`

        this.selectedCharger = null
        throw err
      } finally {
        this.loading = false
      }
    },
    setFilters(newFilters: Partial<ChargerState['filters']>) {
      this.filters = { ...this.filters, ...newFilters }
    },
    setSelectedCharger(charger: ChargingStation | null) {
      this.selectedCharger = charger
    },
    clearChargerErrors() {
      this.error = null
      this.fieldErrors = null
    },
  },
})
