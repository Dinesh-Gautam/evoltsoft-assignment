<template>
  <form @submit.prevent="submitForm" :class="cn('flex flex-col gap-6')">
    <div class="grid gap-2">
      <Label for="name">Name</Label>
      <Input
        id="name"
        v-model.trim="form.name"
        required
        autofocus
        :class="{ 'border-destructive': chargerStore.fieldErrors?.name }"
      />
      <p v-if="chargerStore.fieldErrors?.name" class="text-sm text-destructive">
        {{ chargerStore.fieldErrors.name }}
      </p>
    </div>

    <div class="grid gap-2">
      <Label for="powerOutput">Power Output (kW)</Label>
      <Input
        id="powerOutput"
        type="number"
        step="0.1"
        v-model.number="form.powerOutput"
        required
        :class="{ 'border-destructive': chargerStore.fieldErrors?.powerOutput }"
      />
      <p v-if="chargerStore.fieldErrors?.powerOutput" class="text-sm text-destructive">
        {{ chargerStore.fieldErrors.powerOutput }}
      </p>
    </div>
    <div class="flex gap-2 flex-wrap">
      <div class="grid gap-2 flex-1">
        <Label for="status">Status</Label>
        <Select
          v-model="form.status"
          required
          :class="{ 'border-destructive': chargerStore.fieldErrors?.status }"
        >
          <SelectTrigger class="w-full" id="status">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <p v-if="chargerStore.fieldErrors?.status" class="text-sm text-destructive">
          {{ chargerStore.fieldErrors.status }}
        </p>
      </div>

      <div class="grid gap-2 flex-1">
        <Label for="connectorType">Connector Type</Label>
        <Select
          v-model="form.connectorType"
          required
          :class="{ 'border-destructive': chargerStore.fieldErrors?.connectorType }"
        >
          <SelectTrigger class="w-full" id="connectorType">
            <SelectValue placeholder="Select Connector Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem
                v-for="option in connectorTypeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <p v-if="chargerStore.fieldErrors?.connectorType" class="text-sm text-destructive">
          {{ chargerStore.fieldErrors.connectorType }}
        </p>
      </div>
    </div>
    <div class="flex gap-2 flex-wrap">
      <div class="grid gap-2 flex-1">
        <Label for="latitude">Latitude</Label>
        <Input
          id="latitude"
          type="number"
          step="any"
          v-model.number="form.latitude"
          required
          :class="{ 'border-destructive': chargerStore.fieldErrors?.['location.latitude'] }"
        />
        <p v-if="chargerStore.fieldErrors?.['location.latitude']" class="text-sm text-destructive">
          {{ formatLocationError('location.latitude') }}
        </p>
      </div>

      <div class="grid gap-2 flex-1">
        <Label for="longitude">Longitude</Label>
        <Input
          id="longitude"
          type="number"
          step="any"
          v-model.number="form.longitude"
          required
          :class="{ 'border-destructive': chargerStore.fieldErrors?.['location.longitude'] }"
        />
        <p v-if="chargerStore.fieldErrors?.['location.longitude']" class="text-sm text-destructive">
          {{ formatLocationError('location.longitude') }}
        </p>
      </div>
    </div>

    <div class="grid gap-2">
      <Label>Select Location on Map</Label>
      <OpenStreetMap
        :initial-center="{
          latitude: form.latitude ?? 28.6139,
          longitude: form.longitude ?? 77.2088,
        }"
        :initial-zoom="form.latitude && form.longitude ? 12 : 10"
        :interactive="true"
        :selected-latitude="form.latitude"
        :selected-longitude="form.longitude"
        @map-click="handleMapClick"
        style="width: 100%"
      />
    </div>

    <div
      v-if="chargerStore.error && !chargerStore.fieldErrors"
      class="text-center text-sm text-destructive"
    >
      {{ chargerStore.error }}
    </div>
    <Button type="submit" class="w-full mt-2">
      {{ charger ? 'Update Charger' : 'Add Charger' }}
    </Button>
  </form>
</template>

<script setup lang="ts">
import OpenStreetMap from '@/components/map.vue' // Import the map component
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useChargerStore } from '@/stores/charger.store' // Import charger store
import type { ChargingStation, ChargingStationForm, Location } from '@/types/charger.types'
import type { PropType } from 'vue'
import { onMounted, onUnmounted, ref, watch } from 'vue' // Added computed

const chargerStore = useChargerStore() // Use charger store

interface SelectOption {
  label: string
  value: string
}

const props = defineProps({
  charger: {
    type: Object as PropType<ChargingStation | null>,
    default: null,
  },
})

const emit = defineEmits(['submit-form'])

const form = ref<ChargingStationForm>({
  name: undefined,
  latitude: undefined,
  longitude: undefined,
  status: undefined,
  powerOutput: undefined,
  connectorType: undefined,
})

const formatLocationError = (
  fieldName: 'location.latitude' | 'location.longitude',
): string | undefined => {
  const errorMessage = chargerStore.fieldErrors?.[fieldName]
  if (errorMessage) {
    const prefixWithQuotes = `"${fieldName}" `

    if (errorMessage.startsWith(prefixWithQuotes)) {
      return errorMessage.substring(prefixWithQuotes.length)
    }

    const prefixWithoutQuotes = `${fieldName} `

    if (errorMessage.startsWith(prefixWithoutQuotes)) {
      return errorMessage.substring(prefixWithoutQuotes.length)
    }
  }

  return errorMessage
}

const statusOptions: SelectOption[] = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
]

const connectorTypeOptions: SelectOption[] = [
  { label: 'Type 1', value: 'Type1' },
  { label: 'Type 2', value: 'Type2' },
  { label: 'CCS', value: 'CCS' },
  { label: 'CHAdeMO', value: 'CHAdeMO' },
  { label: 'Tesla', value: 'Tesla' },
  { label: 'Other', value: 'Other' },
]

const submitForm = () => {
  if (
    form.value.name === undefined ||
    form.value.latitude === undefined ||
    form.value.longitude === undefined ||
    form.value.status === undefined ||
    form.value.powerOutput === undefined ||
    form.value.connectorType === undefined
  ) {
    console.warn('Form has missing fields. Submission might fail backend validation.')
  }

  const submissionData: Omit<ChargingStation, '_id' | 'createdAt' | 'updatedAt' | 'location'> & {
    location: Location
  } = {
    name: form.value.name!,
    location: {
      latitude: form.value.latitude!,
      longitude: form.value.longitude!,
    },
    status: form.value.status as ChargingStation['status'],
    powerOutput: form.value.powerOutput!,
    connectorType: form.value.connectorType as ChargingStation['connectorType'],
  }
  emit('submit-form', submissionData)
}

const handleMapClick = (coords: { latitude: number; longitude: number }) => {
  form.value.latitude = coords.latitude
  form.value.longitude = coords.longitude
}

const populateForm = (chargerData: ChargingStation | null) => {
  chargerStore.clearChargerErrors()

  if (chargerData) {
    form.value.name = chargerData.name
    form.value.latitude = chargerData.location.latitude
    form.value.longitude = chargerData.location.longitude
    form.value.status = chargerData.status
    form.value.powerOutput = chargerData.powerOutput
    form.value.connectorType = chargerData.connectorType
  } else {
    form.value.name = undefined
    form.value.latitude = undefined
    form.value.longitude = undefined
    form.value.status = undefined
    form.value.powerOutput = undefined
    form.value.connectorType = undefined
  }
}

watch(
  () => props.charger,
  (newCharger) => {
    populateForm(newCharger)
  },
  { immediate: true },
)

onMounted(() => {
  populateForm(props.charger)
})

onUnmounted(() => {
  chargerStore.clearChargerErrors()
})
</script>
