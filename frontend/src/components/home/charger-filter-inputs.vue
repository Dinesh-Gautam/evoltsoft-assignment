<template>
  <div class="space-y-2 flex-1">
    <Label :for="`${props.idPrefix || 'filter'}-status`">Status</Label>
    <Select :id="`${props.idPrefix || 'filter'}-status`" v-model="statusModel">
      <SelectTrigger class="w-full">
        <SelectValue placeholder="Any Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
  <div class="space-y-2 flex-1">
    <Label :for="`${props.idPrefix || 'filter'}-power`">Min Power (kW)</Label>
    <Input
      :id="`${props.idPrefix || 'filter'}-power`"
      type="number"
      v-model="powerOutputModel"
      placeholder="Any Power"
      :min="0"
    />
  </div>
  <div class="space-y-2 flex-1">
    <Label :for="`${props.idPrefix || 'filter'}-connectorType`">Connector Type</Label>
    <Select :id="`${props.idPrefix || 'filter'}-connectorType`" v-model="connectorTypeModel">
      <SelectTrigger class="w-full">
        <SelectValue placeholder="Any Connector Type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="option in connectorTypeOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChargingStation } from '@/types/charger.types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Filters {
  status: ChargingStation['status'] | null
  powerOutput: ChargingStation['powerOutput'] | null
  connectorType: ChargingStation['connectorType'] | null
}

interface Option {
  label: string
  value: string
}

const props = defineProps<{
  modelValue: Filters
  statusOptions: Option[]
  connectorTypeOptions: Option[]
  idPrefix?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Filters): void
}>()

const statusModel = computed({
  get: () => props.modelValue.status,
  set: (value) => {
    emit('update:modelValue', { ...props.modelValue, status: value })
  },
})

const powerOutputModel = computed<string | number | undefined>({
  get: () => {
    return props.modelValue.powerOutput === null ? undefined : props.modelValue.powerOutput
  },
  set: (value) => {
    let newPowerOutput: number | null = null
    if (typeof value === 'number') {
      newPowerOutput = value
    } else if (value === null || value === undefined) {
      newPowerOutput = null
    } else if (typeof value === 'string') {
      if (value.trim() === '') {
        newPowerOutput = null
      } else {
        const num = parseFloat(value)
        newPowerOutput = isNaN(num) ? null : num
      }
    }
    emit('update:modelValue', { ...props.modelValue, powerOutput: newPowerOutput })
  },
})

const connectorTypeModel = computed({
  get: () => props.modelValue.connectorType,
  set: (value) => {
    emit('update:modelValue', { ...props.modelValue, connectorType: value })
  },
})
</script>
