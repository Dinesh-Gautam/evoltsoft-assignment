<template>
  <div class="login-view flex items-center justify-center min-h-screen">
    <div
      class="login-container w-full max-w-md p-6 border bg-background/60 rounded-xl py-12 backdrop-blur-md"
    >
      <LoginForm @submitForm="handleLogin" />
    </div>
    <img
      class="fixed inset-0 -z-10 h-[200%] object-cover object-center"
      src="@/assets/background.png"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import LoginForm from '@/components/login-form.vue'

const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async (formData: { email: string; password: string }) => {
  if (!formData.email || !formData.password) {
    authStore.error = 'Email and Password are required.'
    return
  }

  authStore.clearError()

  try {
    await authStore.login({ emailOrUsername: formData.email, password: formData.password })

    if (authStore.isAuthenticated) {
      router.push('/')
    } else if (authStore.error) {
      console.error('Login Failed:', authStore.error)
    }
  } catch (error: any) {
    const message =
      error?.response?.data?.message || authStore.error || 'An unexpected error occurred.'

    authStore.error = message

    console.error('Login Error:', message)
  }
}
</script>
