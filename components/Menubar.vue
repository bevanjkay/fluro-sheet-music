<script setup lang="ts">
export interface MenuItem {
  label: string
  icon?: string
  to?: string
  command?: () => void
}

withDefaults(defineProps<{ model?: MenuItem[] }>(), {
  model: () => [],
});

const route = useRoute();

// A destination is current when the route sits inside it, so a song or plan
// detail still shows which section it came from.
const isCurrent = (item: MenuItem): boolean => {
  if (!item.to) return false;
  if (item.to === "/") return route.path === "/";
  return route.path === item.to || route.path.startsWith(`${item.to}/`);
};
</script>

<template>
  <nav
    class="flex items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white/90 px-2 py-1.5 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90"
    aria-label="Main"
  >
    <ul class="flex min-w-0 items-center gap-0.5 overflow-x-auto">
      <li v-for="item in model" :key="item.label" class="shrink-0">
        <button
          type="button"
          :title="item.label"
          :aria-label="item.label"
          :aria-current="isCurrent(item) ? 'page' : undefined"
          class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 sm:px-3"
          :class="isCurrent(item)
            ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'"
          @click="item.command?.()"
        >
          <AppIcon v-if="item.icon" :name="item.icon" :size="18" />
          <span class="hidden sm:inline">{{ item.label }}</span>
        </button>
      </li>
    </ul>
    <div class="shrink-0">
      <slot name="end" />
    </div>
  </nav>
</template>
