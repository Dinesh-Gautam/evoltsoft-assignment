<template>
  <Accordion type="single" collapsible class="flex flex-col gap-2">
    <AccordionItem
      v-for="charger in chargers"
      :key="charger._id"
      class="bg-card px-4 rounded-lg shadow"
      :value="charger._id!"
    >
      <AccordionTrigger class="flex items-center hover:no-underline py-2">
        <div>
          <h3 class="text-lg font-semibold">{{ charger.name }}</h3>
          <div class="flex gap-2 opacity-50 my-1 text-xs flex-wrap">
            <p class="flex items-center gap-x-1">
              <InfoIcon class="h-4 w-4 text-muted-foreground" />
              <span class="font-semibold">
                {{ charger.status }}
              </span>
            </p>
            <p class="flex items-center gap-x-1">
              <PowerIcon class="h-4 w-4 text-muted-foreground" />
              <span class="font-semibold"> {{ charger.powerOutput }} kW </span>
            </p>
            <p class="flex items-center gap-x-1">
              <PlugIcon class="h-4 w-4 text-muted-foreground" />
              <span class="font-semibold">
                {{ charger.connectorType }}
              </span>
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <p class="flex items-center gap-x-1 flex-wrap">
          <MapPinIcon class="h-4 w-4 text-muted-foreground" /><span
            class="text-foreground/60 font-semibold"
            >Location:</span
          >
          <span class="font-semibold">
            {{ charger.location.latitude.toFixed(4) }},
            {{ charger.location.longitude.toFixed(4) }}
          </span>
        </p>
        <p class="flex items-center gap-x-1 flex-wrap">
          <InfoIcon class="h-4 w-4 text-muted-foreground" /><span
            class="text-foreground/60 font-semibold"
            >Status:
          </span>
          <span class="font-semibold">
            {{ charger.status }}
          </span>
        </p>
        <p class="flex items-center gap-x-1 flex-wrap">
          <PowerIcon class="h-4 w-4 text-muted-foreground" /><span
            class="text-foreground/60 font-semibold"
            >Power:
          </span>
          <span class="font-semibold"> {{ charger.powerOutput }} kW </span>
        </p>
        <p class="flex items-center gap-x-1 flex-wrap">
          <PlugIcon class="h-4 w-4 text-muted-foreground" />
          <span class="text-foreground/60 font-semibold">Connector: </span>
          <span class="font-semibold">
            {{ charger.connectorType }}
          </span>
        </p>
        <div v-if="isAuthenticated" class="mt-3 flex flex-wrap gap-2">
          <Button
            class="cursor-pointer flex-1"
            variant="outline"
            size="sm"
            @click="$emit('edit-charger', charger)"
            ><FilePenLineIcon class="mr-2 h-4 w-4" />Edit</Button
          >
          <Button
            class="text-red-500 bg-red-400/10 hover:bg-inherit hover:border-red-500 border focus:shadow-red-600/20 rounded-md leading-none outline-none focus:shadow-[0_0_0_2px] cursor-pointer flex-1"
            variant="secondary"
            size="sm"
            @click="$emit('open-delete-dialog', charger)"
            ><Trash2Icon class="mr-2 h-4 w-4" />Delete</Button
          >
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>

<script setup lang="ts">
import type { ChargingStation } from '@/types/charger.types'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  FilePenLineIcon,
  Trash2Icon,
  MapPinIcon,
  PowerIcon,
  PlugIcon,
  InfoIcon,
} from 'lucide-vue-next'

defineProps<{
  chargers: ChargingStation[]
  isAuthenticated: boolean
}>()

defineEmits<{
  (e: 'edit-charger', charger: ChargingStation): void
  (e: 'open-delete-dialog', charger: ChargingStation): void
}>()
</script>
