import { useStorage } from "@vueuse/core";


function isAuthenticated() {
    const user = useStorage('_fluro_user', { token: null }).value
    console.log("From middleware", user.token);
    if (user.token) {
        return true;
    }
    return false;
}

export default defineNuxtRouteMiddleware((to, from) => {
        if (to.path === '/login') return;
        
        // isAuthenticated() is an example method verifying if a user is authenticated
        if (isAuthenticated() === false) {
            return navigateTo('/login')
        }
    });

