import { ref, onMounted, onUnmounted } from 'vue'

export function useScreenSize(breakpoint = 768) {
  const isMobile = ref(false)

  const checkScreenSize = () => {
    isMobile.value = window.innerWidth < breakpoint
  }

  onMounted(() => {
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkScreenSize)
  })

  return {
    isMobile,
  }
}
