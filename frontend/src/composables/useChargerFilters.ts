import { ref, watch, computed } from 'vue'
import { useRouter, useRoute, type LocationQuery } from 'vue-router'
import { useChargerStore } from '@/stores/charger.store'
import type { ChargingStation } from '@/types/charger.types'

export interface ChargerFilters {
  status: ChargingStation['status'] | null
  powerOutput: ChargingStation['powerOutput'] | null
  connectorType: ChargingStation['connectorType'] | null
}

export function useChargerFilters() {
  const chargerStore = useChargerStore()
  const router = useRouter()
  const route = useRoute()

  const localFilters = ref<ChargerFilters>({
    status: null,
    powerOutput: null,
    connectorType: null,
  })

  const statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ]

  const connectorTypeOptions = [
    { label: 'Type 1', value: 'Type1' },
    { label: 'Type 2', value: 'Type2' },
    { label: 'CCS', value: 'CCS' },
    { label: 'CHAdeMO', value: 'CHAdeMO' },
    { label: 'Tesla', value: 'Tesla' },
    { label: 'Other', value: 'Other' },
  ]

  const filtersExists = computed(() => {
    return (
      localFilters.value.status !== null ||
      localFilters.value.powerOutput !== null ||
      localFilters.value.connectorType !== null
    )
  })

  const updateFiltersFromRoute = () => {
    const query = route.query
    const statusFromQuery = query.status ? (query.status as ChargingStation['status']) : null
    const powerFromQuery = query.powerOutput ? Number(query.powerOutput) : null
    const connectorFromQuery = query.connectorType
      ? (query.connectorType as ChargingStation['connectorType'])
      : null

    localFilters.value = {
      status: statusFromQuery,
      powerOutput: powerFromQuery,
      connectorType: connectorFromQuery,
    }

    const filtersForStore = {
      status: statusFromQuery || null,
      powerOutput: powerFromQuery,
      connectorType: connectorFromQuery || null,
    }

    chargerStore.setFilters(filtersForStore)

    if (Object.keys(query).length > 0 || chargerStore.chargers.length === 0) {
      chargerStore.fetchChargers(filtersForStore)
    }
  }

  const applyFiltersToRoute = () => {
    const query: LocationQuery = {}

    if (localFilters.value.status) {
      query.status = localFilters.value.status
    }

    if (localFilters.value.powerOutput !== null && localFilters.value.powerOutput !== undefined) {
      query.powerOutput = String(localFilters.value.powerOutput)
    }

    if (localFilters.value.connectorType) {
      query.connectorType = localFilters.value.connectorType
    }

    router.push({ name: 'home', query })
  }

  const clearhomeFilters = () => {
    localFilters.value = {
      status: null,
      powerOutput: null,
      connectorType: null,
    }

    router.push({ name: 'home', query: {} })
  }

  watch(() => route.query, updateFiltersFromRoute, { deep: true, immediate: true })

  return {
    localFilters,
    statusOptions,
    connectorTypeOptions,
    filtersExists,
    applyFiltersToRoute,
    clearhomeFilters,
    updateFiltersFromRoute,
  }
}
