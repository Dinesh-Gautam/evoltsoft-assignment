<template>
  <AlertDialog :open="open" @update:open="$emit('update:open', $event)">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete "{{ chargerName }}"? This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="$emit('update:open', false)">Cancel</AlertDialogCancel>
        <AlertDialogAction
          class="text-red-500 bg-red-400/10 hover:bg-inherit hover:border-red-500 border focus:shadow-red-600/20 rounded-md leading-none outline-none focus:shadow-[0_0_0_2px]"
          @click="handleConfirmDelete"
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

defineProps<{
  open: boolean
  chargerName: string | undefined
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm-delete'): void
}>()

const handleConfirmDelete = () => {
  emit('confirm-delete')
  emit('update:open', false)
}
</script>
