<template>
  <div class="edit-charger-view md:p-6 p-4 shadow-md mt-2">
    <h1 class="text-2xl font-bold mb-4">Edit Charger</h1>
    <div v-if="chargerStore.loading" class="text-center">
      <p>Loading charger details...</p>
    </div>
    <div v-else-if="chargerStore.error" class="p-error text-center">
      <p>{{ chargerStore.error }}</p>
      <Button label="Go to Home" @click="router.push({ name: 'home' })" class="mt-2" />
    </div>
    <ChargerForm
      v-else-if="chargerStore.selectedCharger"
      :charger="chargerStore.selectedCharger"
      @submit-form="handleChargerUpdate"
    />
    <div v-else class="text-center">
      <p>Charger not found or not loaded.</p>
      <Button label="Go to home" @click="router.push({ name: 'home' })" class="mt-2" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ChargerForm from '@/components/charger-form.vue'
import { Button } from '@/components/ui/button'
import { useChargerStore } from '@/stores/charger.store'
import type { ChargingStation, Location } from '@/types/charger.types'
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const router = useRouter()
const chargerStore = useChargerStore()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const loadCharger = async (chargerId: string) => {
  if (chargerId) {
    // check if the charger is already in the list to avoid unnecessary fetch
    const existingCharger = chargerStore.chargers.find((c) => c._id === chargerId)

    if (existingCharger) {
      chargerStore.setSelectedCharger({ ...existingCharger })
      chargerStore.error = null
    } else {
      await chargerStore.fetchChargerById(chargerId)
    }
  } else {
    chargerStore.error = 'No charger ID provided.'
    chargerStore.setSelectedCharger(null)
  }
}

onMounted(() => {
  loadCharger(props.id)
})

watch(
  () => props.id,
  (newId) => {
    loadCharger(newId)
  },
)

const handleChargerUpdate = async (
  formData: Omit<ChargingStation, '_id' | 'createdAt' | 'updatedAt'> & { location: Location },
) => {
  if (!chargerStore.selectedCharger?._id) {
    toast.error('No charger selected for update.')
    return
  }

  try {
    const updatePayload: Partial<
      Omit<ChargingStation, '_id' | 'createdAt' | 'updatedAt' | 'location'> & {
        location: Location
      }
    > = {
      name: formData.name,
      location: {
        latitude: formData.location.latitude,
        longitude: formData.location.longitude,
      },
      status: formData.status,
      powerOutput: formData.powerOutput,
      connectorType: formData.connectorType,
    }

    await chargerStore.updateCharger(chargerStore.selectedCharger._id, updatePayload)

    toast.success('Charger updated successfully!')
    router.push({ name: 'home' })
  } catch (error: any) {
    const errorMessage =
      chargerStore.fieldErrors && Object.keys(chargerStore.fieldErrors).length > 0
        ? 'Please check the form for errors.'
        : chargerStore.error || error.message || 'Failed to update charger.'

    toast.error(errorMessage)
    console.error('Failed to update charger:', error)
  }
}
</script>
