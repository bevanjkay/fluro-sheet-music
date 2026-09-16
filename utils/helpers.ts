import { useStorage } from "@vueuse/core";

// Weekday first: on stage the useful question is "is this the Sunday one?",
// which a numeric date cannot answer at a glance.
export const formatDate = (date: Date | null) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function isAuthenticated(): boolean {
  const user: Ref<User> = useStorage("_fluro_user", { token: "", refreshToken: "" });
  if (user.value.token) {
    return true;
  }
  return false;
}

/**
 * Get the estimated size of localStorage in bytes
 */
export function getLocalStorageSize(): number {
  let total = 0;
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
}

/**
 * Clear old expired cache entries from localStorage
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  const expiryKeys = Object.keys(localStorage).filter(key => key.endsWith("Expiry"));
  
  expiryKeys.forEach(expiryKey => {
    const expiry = localStorage.getItem(expiryKey);
    if (expiry && parseInt(expiry) < now) {
      // Remove both the expiry key and the corresponding data key
      const dataKey = expiryKey.replace("Expiry", "");
      localStorage.removeItem(expiryKey);
      localStorage.removeItem(dataKey);
      console.log(`Cleared expired cache: ${dataKey}`);
    }
  });
}

/**
 * Check if localStorage is approaching capacity and warn user
 * Most browsers limit localStorage to 5-10MB
 */
export function checkLocalStorageCapacity(): boolean {
  const size = getLocalStorageSize();
  const maxSize = 5 * 1024 * 1024; // 5MB conservative limit
  
  if (size > maxSize * 0.8) {
    console.warn(`localStorage is ${Math.round((size / maxSize) * 100)}% full (${Math.round(size / 1024)}KB)`);
    return true;
  }
  return false;
}