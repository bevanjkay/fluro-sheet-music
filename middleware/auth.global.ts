import type { RouteLocationNormalizedGeneric } from "vue-router";
import { refresh } from "./../utils/login";
import { useStorage } from "@vueuse/core";

const user = useStorage("_fluro_user", { token: "", refreshToken: "" });

export function isAuthenticated(): boolean {
  if (user.value.token) {
    return true;
  }
  return false;
}

function navigateToLogin(to: RouteLocationNormalizedGeneric) {

  if (to.path !== "/login") {
    return navigateTo("/login");
  }

  return;
}

export default defineNuxtRouteMiddleware(async (to) => {

  if (to.path === "/login") {
    if (isAuthenticated()) {
      return navigateTo("/");
    }
    return;
  }

  try {

    console.log("Checking user session", user.value);

    const response = await getUserSession(user.value);

    console.log("User session response", response);
    if (response.error) {
      return navigateToLogin(to);
    }

  } catch (sessionError) {

    console.error("Error fetching user session", sessionError);

    if (user.value.refreshToken) {

      try {
        console.info("Refreshing token", user.value.refreshToken);
        const response = await refresh(user.value.refreshToken);
        user.value.token = response.token;
      } catch (refreshError) {
        console.error("Error refreshing token", refreshError);
        user.value.token = "";
        user.value.refreshToken = "";
      }

    } else {

      return navigateToLogin(to);

    }

    if (isAuthenticated()) {
      return;
    } else {
      return navigateToLogin(to);
    }
  }
});
