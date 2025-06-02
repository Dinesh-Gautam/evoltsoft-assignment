<template>
  <Toaster />
  <div id="app-layout" class="flex flex-col max-w-[1330px] mx-auto">
    <header
      :class="[
        'mt-2 z-40 rounded-xl flex justify-between items-center p-2 bg-card shadow-md',
        { hidden: shouldHideNav },
      ]"
    >
      <RouterLink to="/">
        <img class="max-h-[20px] px-4" src="@/assets/logo.png" />
      </RouterLink>

      <div v-if="!isLoggedIn" class="flex">
        <Button as-child size="sm" variant="secondary" aria-label="Login">
          <RouterLink to="/login"> Login </RouterLink>
        </Button>
      </div>
      <div v-else>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Avatar class="cursor-pointer">
              <AvatarFallback class="font-bold text-sm">
                {{ authStore.user?.username.slice(0, 2).toUpperCase() }}</AvatarFallback
              >
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel class="flex flex-col">
              <span class="font-normal text-sm text-foreground/50 capitalize">
                {{ authStore.user?.username }}
              </span>
              <span class="font-md">
                {{ authStore.user?.email }}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="cursor-pointer" @click="logout">
              <LogOut class="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    <main class="app-main flex-1">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Button from '@/components/ui/button/Button.vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut } from 'lucide-vue-next'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { Toaster } from 'vue-sonner'

import 'vue-sonner/style.css'

const route = useRoute()
const authStore = useAuthStore()
const router = useRouter()

const shouldHideNav = computed(() => {
  return route.name === 'login' || route.name === 'register'
})

const isLoggedIn = computed(() => {
  return authStore.isAuthenticated
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
