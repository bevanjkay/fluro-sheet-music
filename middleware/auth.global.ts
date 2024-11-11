import { useStorage } from "@vueuse/core";

function isAuthenticated(): boolean {
  const user: Ref<User> = useStorage("_fluro_user", { token: "", refreshToken: "" });
  if (user.value.token) {
    return true;
  }
  return false;
}

export default defineNuxtRouteMiddleware((to): string | undefined => {
  if (to.path == "/login") {
    if (isAuthenticated() == true) {
      return "/";
    }
    return;
  }

  if (isAuthenticated() === false) {
    return "/login";
  }

  return;
});
