<script setup lang="ts">
defineProps<{ header?: string }>();
</script>

<template>
  <section class="rounded-xl border border-zinc-200 bg-white text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50">
    <header v-if="header" class="border-b border-zinc-200 px-5 py-3.5 text-lg font-bold tracking-tight dark:border-zinc-700">
      {{ header }}
    </header>
    <div class="p-5">
      <slot />
    </div>
  </section>
</template>
