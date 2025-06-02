<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Location</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Power (kW)</TableHead>
        <TableHead>Connector</TableHead>
        <TableHead v-if="isAuthenticated" class="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="charger in chargers" :key="charger._id">
        <TableCell class="font-medium">{{ charger.name }}</TableCell>
        <TableCell>
          {{ charger.location.latitude.toFixed(4) }},
          {{ charger.location.longitude.toFixed(4) }}
        </TableCell>
        <TableCell>{{ charger.status }}</TableCell>
        <TableCell>{{ charger.powerOutput }} kW</TableCell>
        <TableCell>{{ charger.connectorType }}</TableCell>
        <TableCell v-if="isAuthenticated" class="text-right space-x-2">
          <Button
            class="cursor-pointer"
            variant="outline"
            size="sm"
            @click="$emit('edit-charger', charger)"
          >
            <FilePenLineIcon class="mr-2 h-4 w-4" />Edit
          </Button>
          <Button
            class="text-red-500 bg-red-400/10 hover:bg-inherit hover:border-red-500 border focus:shadow-red-600/20 rounded-md leading-none outline-none focus:shadow-[0_0_0_2px] cursor-pointer"
            variant="secondary"
            size="sm"
            @click="$emit('open-delete-dialog', charger)"
          >
            <Trash2Icon class="mr-2 h-4 w-4" />Delete
          </Button>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>

<script setup lang="ts">
import type { ChargingStation } from '@/types/charger.types'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FilePenLineIcon, Trash2Icon } from 'lucide-vue-next'

defineProps<{
  chargers: ChargingStation[]
  isAuthenticated: boolean
}>()

defineEmits<{
  (e: 'edit-charger', charger: ChargingStation): void
  (e: 'open-delete-dialog', charger: ChargingStation): void
}>()
</script>
