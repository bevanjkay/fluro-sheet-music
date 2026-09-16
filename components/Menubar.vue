<script setup lang="ts">
export interface MenuItem {
  label: string
  icon?: string
  command?: () => void
}

withDefaults(defineProps<{ model?: MenuItem[] }>(), {
  model: () => [],
});
</script>

<template>
  <nav
    class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white/90 px-3 py-2 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/90"
    aria-label="Main"
  >
    <ul class="flex flex-wrap items-center gap-1">
      <li v-for="item in model" :key="item.label">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-200 dark:hover:bg-zinc-800"
          @click="item.command?.()"
        >
          <AppIcon v-if="item.icon" :name="item.icon" :size="16" />
          {{ item.label }}
        </button>
      </li>
    </ul>
    <slot name="end" />
  </nav>
</template>
