import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth.store'
import LoginView from '@/views/login-view.vue'
import RegisterView from '@/views/register-view.vue'
import HomeView from '@/views/home-view.vue'
import AddChargerView from '@/views/add-charger-view.vue'
import EditChargerView from '@/views/edit-charger-view.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/chargers/add',
      name: 'add-charger',
      component: AddChargerView,
      meta: { requiresAuth: true },
    },
    {
      path: '/charger/edit/:id',
      name: 'edit-charger',
      component: EditChargerView,
      meta: { requiresAuth: true },
      props: true,
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.token && localStorage.getItem('token')) {
    authStore.checkAuth()
  }

  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    // If user is authenticated and tries to access login/register page, redirect to home
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
