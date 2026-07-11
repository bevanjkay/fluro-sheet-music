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
  if (to.path === "/ipad-sim") {
    return;
  }

  if (to.path === "/login") {
    if (isAuthenticated()) {
      return navigateTo("/");
    }
    return;
  }

  try {

    const response = await getUserSession(user.value);

    if (response.error) {
      return navigateToLogin(to);
    }

  } catch (sessionError) {

    console.error("Error fetching user session", sessionError);

    if (user.value.refreshToken) {

      try {
        const response = await refresh(user.value.refreshToken);
        if (!response.token) {
          throw new Error("No token returned from refresh", { cause: sessionError });
        }
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

  if (!isAuthenticated()) {
    return navigateToLogin(to);
  }
  return;
});
