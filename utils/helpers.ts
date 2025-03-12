import { useStorage } from "@vueuse/core";

export const formatDate = (date: Date | null) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString();
};

export function isAuthenticated(): boolean {
  const user: Ref<User> = useStorage("_fluro_user", { token: "", refreshToken: "" });
  if (user.value.token) {
    return true;
  }
  return false;
}