<template>
  <div class="chargers-view bg-card text-card-foreground shadow-md rounded-lg md:p-6 p-4">
    <div class="max-h-[60vh] overflow-auto pb-4">
      <div class="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h1 class="text-2xl font-bold">Charging Stations</h1>
        <Button v-if="authStore.isAuthenticated" size="lg" @click="navigateToAddCharger"
          ><PlusIcon class="h-4 w-4" />
          <span v-if="!isMobile"> Add Charger </span>
        </Button>
      </div>

      <div class="md:hidden mb-4">
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-lg font-semibold">Filters</h2>
          <Dialog v-model:open="isFilterDialogOpen">
            <DialogTrigger as-child>
              <Button variant="outline" size="sm">
                <SlidersHorizontalIcon class="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Set Filters</DialogTitle>
              </DialogHeader>
              <ChargerFilterInputs
                v-model="localFilters"
                :status-options="statusOptions"
                :connector-type-options="connectorTypeOptions"
                id-prefix="mFilter"
                class="py-4"
              />
              <DialogFooter>
                <Button v-if="filtersExists" variant="secondary" @click="clearhomeFiltersDialog"
                  ><XIcon class="mr-2 h-4 w-4" />Clear</Button
                >
                <Button @click="applyFiltersDialog"
                  ><FilterIcon class="mr-2 h-4 w-4" />Apply Filters</Button
                >
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <!-- Filter Chips -->
        <div v-if="appliedFiltersForChips.length > 0" class="flex flex-wrap gap-2 mt-2">
          <Badge
            v-for="chip in appliedFiltersForChips"
            :key="chip.key"
            variant="secondary"
            class="flex items-center p-1"
          >
            {{ chip.type }}: {{ chip.value }}
            <button
              @click="removeFilterChip(chip.key as 'status' | 'powerOutput' | 'connectorType')"
              class="ml-1.5 p-0.5 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
            >
              <XIcon class="h-3 w-3" />
            </button>
          </Badge>
        </div>
        <div v-else class="text-sm text-muted-foreground mt-2">
          No filters applied. Tap 'Filter' to set.
        </div>
      </div>

      <div class="hidden md:flex mb-2 gap-2 flex-wrap items-end justify-end">
        <ChargerFilterInputs
          v-model="localFilters"
          :status-options="statusOptions"
          :connector-type-options="connectorTypeOptions"
          id-prefix="dFilter"
          class="contents"
        />

        <div class="flex items-end gap-2 flex-wrap">
          <Button
            v-if="filtersExists"
            class="cursor-pointer flex-1"
            variant="outline"
            @click="applyFiltersToRoute"
            ><FilterIcon class="mr-2 h-4 w-4" />Apply Filters</Button
          >
          <Button
            v-if="filtersExists"
            class="cursor-pointer flex-1"
            variant="secondary"
            @click="clearhomeFilters"
            ><XIcon class="mr-2 h-4 w-4" />Clear Filters</Button
          >
        </div>
      </div>

      <div>
        <div v-if="chargerStore.loading" class="text-center py-4">
          Loading charger data. Please wait...
        </div>
        <div
          v-else-if="!chargerStore.filteredChargers || chargerStore.filteredChargers.length === 0"
          class="text-center py-4"
        >
          No chargers found.
        </div>

        <ChargerDesktopTable
          v-else-if="!isMobile"
          :chargers="chargerStore.filteredChargers"
          :is-authenticated="authStore.isAuthenticated"
          @edit-charger="editCharger"
          @open-delete-dialog="openConfirmDeleteDialog"
        />

        <ChargerMobileList
          v-else-if="isMobile"
          :chargers="chargerStore.filteredChargers"
          :is-authenticated="authStore.isAuthenticated"
          @edit-charger="editCharger"
          @open-delete-dialog="openConfirmDeleteDialog"
        />
      </div>
    </div>

    <div class="mt-6">
      <OpenStreetMap
        ref="openStreetMapRef"
        :initial-center="{ latitude: 28.6139, longitude: 77.2088 }"
        :initial-zoom="8"
        :markers="chargerMarkers"
        @marker-click="handleMarkerClick"
        style="width: 100%"
      />
    </div>

    <ConfirmDeleteChargerDialog
      v-model:open="isConfirmDeleteDialogOpen"
      :charger-name="chargerToDelete?.name"
      @confirm-delete="handleDeleteCharger"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChargerStore } from '@/stores/charger.store'
import { useAuthStore } from '@/stores/auth.store'
import type { ChargingStation } from '@/types/charger.types'
import OpenStreetMap from '@/components/map.vue'
import ChargerFilterInputs from '@/components/home/charger-filter-inputs.vue'
import ChargerDesktopTable from '@/components/home/charger-desktop-table.vue'
import ChargerMobileList from '@/components/home/charger-mobile-list.vue'
import ConfirmDeleteChargerDialog from '@/components/dialogs/delete-confirm-dialog.vue'
import { useChargerFilters } from '@/composables/useChargerFilters'
import { useScreenSize } from '@/composables/useScreenSize'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'vue-sonner'
import { FilterIcon, PlusIcon, XIcon, SlidersHorizontalIcon } from 'lucide-vue-next'

const chargerStore = useChargerStore()
const authStore = useAuthStore()
const router = useRouter()

const { isMobile } = useScreenSize()

const {
  localFilters,
  statusOptions,
  connectorTypeOptions,
  filtersExists,
  applyFiltersToRoute,
  clearhomeFilters,
} = useChargerFilters()

const openStreetMapRef = ref<InstanceType<typeof OpenStreetMap> | null>(null)
const isConfirmDeleteDialogOpen = ref(false)
const chargerToDelete = ref<ChargingStation | null>(null)
const isFilterDialogOpen = ref(false)

const appliedFiltersForChips = computed(() => {
  const chips: { type: string; value: string; key: 'status' | 'powerOutput' | 'connectorType' }[] =
    []

  if (localFilters.value.status) {
    chips.push({ type: 'Status', value: localFilters.value.status, key: 'status' })
  }

  if (localFilters.value.powerOutput !== null && localFilters.value.powerOutput !== undefined) {
    chips.push({
      type: 'Min Power',
      value: `${localFilters.value.powerOutput} kW`,
      key: 'powerOutput',
    })
  }

  if (localFilters.value.connectorType) {
    chips.push({ type: 'Connector', value: localFilters.value.connectorType, key: 'connectorType' })
  }

  return chips
})

const removeFilterChip = (key: 'status' | 'powerOutput' | 'connectorType') => {
  if (key === 'status') localFilters.value.status = null
  else if (key === 'powerOutput') localFilters.value.powerOutput = null
  else if (key === 'connectorType') localFilters.value.connectorType = null
  applyFiltersToRoute()
}

const applyFiltersDialog = () => {
  applyFiltersToRoute()
  isFilterDialogOpen.value = false
}

const clearhomeFiltersDialog = () => {
  clearhomeFilters()
  isFilterDialogOpen.value = false
}

const chargerMarkers = computed(() => {
  return chargerStore.filteredChargers
    .filter((charger) => charger._id !== undefined)
    .map((charger) => ({
      id: charger._id!,
      latitude: charger.location.latitude,
      longitude: charger.location.longitude,
      name: charger.name,
    }))
})

const navigateToAddCharger = () => {
  router.push({ name: 'add-charger' })
}

const editCharger = (charger: ChargingStation) => {
  router.push({ name: 'edit-charger', params: { id: charger._id } })
}

const openConfirmDeleteDialog = (charger: ChargingStation) => {
  chargerToDelete.value = charger
  isConfirmDeleteDialogOpen.value = true
}

const handleDeleteCharger = async () => {
  if (chargerToDelete.value && chargerToDelete.value._id) {
    try {
      await chargerStore.deleteCharger(chargerToDelete.value._id)
      toast.success('Charger deleted successfully.')
    } catch (error: any) {
      toast.error('failed to delete charger')
    }
  }

  chargerToDelete.value = null
}

const handleMarkerClick = (markerData: {
  id: string | number
  latitude: number
  longitude: number
  name?: string
}) => {
  const charger = chargerStore.filteredChargers.find((c) => c._id === markerData.id)

  if (charger && openStreetMapRef.value) {
    openStreetMapRef.value.hidePopup()

    const popupContentHtml = `
      <div style="font-family: sans-serif; font-size: 0.9rem;">
        <h4 style="margin-top: 0; margin-bottom: 5px; font-size: 1.1rem;">${charger.name}</h4>
        <p style="margin: 3px 0;"><strong>Status:</strong> ${charger.status}</p>
        <p style="margin: 3px 0;"><strong>Power:</strong> ${charger.powerOutput} kW</p>
        <p style="margin: 3px 0;"><strong>Connector:</strong> ${charger.connectorType}</p>
      </div>
    `
    openStreetMapRef.value.setView(
      { latitude: charger.location.latitude, longitude: charger.location.longitude },
      15,
    )

    openStreetMapRef.value.showPopup(
      { latitude: charger.location.latitude, longitude: charger.location.longitude },
      popupContentHtml,
    )
  } else {
    console.log('Marker clicked, but charger or map ref not found:', markerData)

    if (charger) {
      toast.info(`Clicked on charger: ${charger.name} (Map interaction disabled)`)
    }
  }
}
</script>
