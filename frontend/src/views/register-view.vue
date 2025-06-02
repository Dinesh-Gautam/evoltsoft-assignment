<template>
  <div class="register-view flex items-center justify-center min-h-screen">
    <div
      class="login-container w-full max-w-md p-6 bg-background/60 rounded-xl py-12 backdrop-blur-md border"
    >
      <RegisterForm @submitForm="handleRegister" />
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
import RegisterForm from '@/components/register-form.vue'

const authStore = useAuthStore()
const router = useRouter()

interface RegisterFormData {
  username: string
  email: string
  password: string
}

const handleRegister = async (formData: RegisterFormData) => {
  if (!formData.username || !formData.email || !formData.password) {
    authStore.error = 'All fields are required.'
    return
  }

  authStore.clearError()

  try {
    await authStore.register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    })

    if (!authStore.error) {
      router.push('/')
    }
  } catch (error: any) {
    if (!authStore.error) {
      const message =
        error?.response?.data?.message || error.message || 'An unexpected error occurred.'
      authStore.error = message
    }

    console.error('Registration Error in view:', authStore.error)
  }
}
</script>
