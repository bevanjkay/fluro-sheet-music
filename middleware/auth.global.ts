import { useStorage } from '@vueuse/core'

function isAuthenticated() {
  const user = useStorage('_fluro_user', { token: null }).value
  if (user.token) {
    return true
  }
  return false
}

export default defineNuxtRouteMiddleware((to) => {
  if (to.path == '/login') {
    if (isAuthenticated() === true) {
      return navigateTo('/')
    }
    return
  }

  if (isAuthenticated() === false) {
    return navigateTo('/login')
  }
})
