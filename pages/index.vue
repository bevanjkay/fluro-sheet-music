<script lang="ts" setup>
const destinations = [
  {
    to: "/plans",
    icon: "calendar",
    title: "Service plans",
    description: "Upcoming services and the songs scheduled for each one.",
  },
  {
    to: "/songs",
    icon: "list",
    title: "Songs",
    description: "Search the full library and open any sheet by key.",
  },
  {
    to: "/custom",
    icon: "grid",
    title: "Custom setlists",
    description: "Build your own running order for rehearsals and one-offs.",
  },
];
</script>

<template>
  <page>
    <div class="mb-10">
      <Typography variant="h1" size="heading-xl">Fluro Sheet Music</Typography>
      <Typography variant="p" size="text" class="mt-2 text-zinc-600 dark:text-zinc-400">
        Your sheet music, ready for the stage.
      </Typography>
    </div>

    <ul class="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      <li v-for="destination in destinations" :key="destination.to">
        <NuxtLink
          :to="destination.to"
          class="flex items-center gap-4 px-5 py-5 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-400 dark:hover:bg-zinc-900"
        >
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <AppIcon :name="destination.icon" :size="20" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{{ destination.title }}</span>
            <span class="block text-sm text-zinc-600 dark:text-zinc-400">{{ destination.description }}</span>
          </span>
          <AppIcon name="chevron-right" :size="18" class="shrink-0 text-zinc-400" />
        </NuxtLink>
      </li>
    </ul>

    <AbsoluteFooter>
      Made with ❤️ by <a href="https://bevankay.me" target="_blank">Bevan Kay</a>
    </AbsoluteFooter>
  </page>
</template>
