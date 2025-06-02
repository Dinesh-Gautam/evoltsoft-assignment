<template>
  <div class="add-charger-view md:p-4 p-6 shadow-md">
    <h1 class="text-2xl font-bold mb-4">Add New Charger</h1>
    <ChargerForm @submit-form="handleChargerSubmit" />
  </div>
</template>

<script setup lang="ts">
import ChargerForm from '@/components/charger-form.vue'
import { useChargerStore } from '@/stores/charger.store'
import type { ChargingStation, Location } from '@/types/charger.types'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const chargerStore = useChargerStore()
const router = useRouter()

const handleChargerSubmit = async (
  formData: Omit<ChargingStation, '_id' | 'createdAt' | 'updatedAt'> & { location: Location },
) => {
  try {
    await chargerStore.createCharger(formData)

    toast.success('Charger added successfully!', {
      duration: 3000,
    })

    router.push({ name: 'home' })
  } catch (error: any) {
    console.error('Failed to add charger:', error)

    toast.error(error.message || 'Failed to add charger.', {
      duration: 3000,
    })
  }
}
</script>
