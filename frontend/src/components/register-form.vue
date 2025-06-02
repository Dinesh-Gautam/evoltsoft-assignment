<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'

const username = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)

const authStore = useAuthStore()

console.log(authStore)

const emit = defineEmits(['submitForm'])

const onSubmit = () => {
  emit('submitForm', { username: username.value, email: email.value, password: password.value })
}
</script>

<template>
  <form @submit.prevent="onSubmit" :class="cn('flex flex-col gap-6')">
    <div class="flex flex-col items-center gap-2 text-center">
      <h1 class="text-2xl font-bold">Create an account</h1>
      <p class="text-balance text-sm text-muted-foreground">
        Enter your details below to create your account
      </p>
    </div>
    <div class="grid gap-6">
      <div class="grid gap-2">
        <Label for="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="yourusername"
          required
          v-model="username"
          :class="{ 'border-destructive': authStore.fieldErrors?.username }"
        />
        <p v-if="authStore.fieldErrors?.username" class="text-sm text-destructive">
          {{ authStore.fieldErrors.username }}
        </p>
      </div>
      <div class="grid gap-2">
        <Label for="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          required
          v-model="email"
          :class="{ 'border-destructive': authStore.fieldErrors?.email }"
        />
        <p v-if="authStore.fieldErrors?.email" class="text-sm text-destructive">
          {{ authStore.fieldErrors.email }}
        </p>
      </div>
      <div class="grid gap-2">
        <Label for="password">Password</Label>
        <div class="relative">
          <Input
            id="password"
            :type="showPassword ? 'text' : 'password'"
            required
            v-model="password"
            class="pr-10"
            placeholder="••••••••"
            :class="{ 'border-destructive': authStore.fieldErrors?.password }"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            @click="showPassword = !showPassword"
          >
            <svg
              v-if="showPassword"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-4 w-4"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-4 w-4"
            >
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path
                d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
              />
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line x1="2" x2="22" y1="2" y2="22" />
            </svg>
            <span class="sr-only">{{ showPassword ? 'Hide password' : 'Show password' }}</span>
          </Button>
        </div>
        <p v-if="authStore.fieldErrors?.password" class="text-sm text-destructive">
          {{ authStore.fieldErrors.password }}
        </p>
      </div>
      <div
        v-if="authStore.error && !authStore.fieldErrors"
        class="text-center text-sm text-destructive"
      >
        {{ authStore.error }}
      </div>
      <Button type="submit" class="w-full"> Create account </Button>
    </div>
    <div class="text-center text-sm">
      Already have an account?
      <RouterLink to="/login" class="underline underline-offset-4"> Login </RouterLink>
    </div>
  </form>
</template>
