import legacy from "@vitejs/plugin-legacy";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  hooks: {
    "pages:extend"(pages) {
      if (!import.meta.dev) {
        const index = pages.findIndex((page) => page.path === "/ipad-sim");
        if (index !== -1) {
          pages.splice(index, 1);
        }
      }
    },
  },
  modules: [
    "reka-ui/nuxt",
    "@pinia/nuxt",
    "@nuxt/eslint",
    "@nuxtjs/tailwindcss",
    ...(process.env.NODE_ENV === "test" ? [] : ["@nuxt/fonts"]),
    "@nuxtjs/device",
  ],
  ssr: false,
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => {
        return ["swiper-slide", "swiper-container"].includes(tag);
      }
    }
  },
  app: {
    head: {
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      ]
    },
    baseURL: process.env.BASE_URL || "/",
  },
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },
  css: ["@/assets/main.scss", "@/assets/css/tailwind.css"],
  compatibilityDate: "2024-04-03",
  typescript: {
    typeCheck: true,
    strict: true,
  },
  vite: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins: [legacy({ targets: ["safari >= 14", "ios >= 14", "defaults"] }) as any],
  },
});
