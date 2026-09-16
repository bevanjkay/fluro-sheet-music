import type { Config } from "tailwindcss";

// `content` is supplied by @nuxtjs/tailwindcss, hence Partial.
export default {
  // The app toggles `.dark` on <html>, so dark: variants must follow the class
  // rather than the OS media query.
  darkMode: "class",
} satisfies Partial<Config>;
