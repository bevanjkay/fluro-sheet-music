<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 48 });
</script>

<template>
  <svg
    class="animate-spin text-zinc-400 dark:text-zinc-500"
    :width="size"
    :height="size"
    viewBox="0 0 50 50"
    role="status"
    aria-label="Loading"
  >
    <circle
      cx="25"
      cy="25"
      r="20"
      fill="none"
      stroke="currentColor"
      stroke-width="4"
      stroke-linecap="round"
      stroke-dasharray="90 60"
    />
  </svg>
</template>
