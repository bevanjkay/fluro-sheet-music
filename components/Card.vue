<script setup lang="ts">
const slots = useSlots();
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-zinc-200 bg-white text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50">
    <div v-if="slots.header">
      <slot name="header" />
    </div>
    <div v-if="slots.title || slots.subtitle" class="px-5 pt-5">
      <div v-if="slots.title" class="text-xl font-bold tracking-tight">
        <slot name="title" />
      </div>
      <div v-if="slots.subtitle" class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        <slot name="subtitle" />
      </div>
    </div>
    <div v-if="slots.content" class="px-5 py-4">
      <slot name="content" />
    </div>
    <div v-if="slots.footer" class="px-5 pb-5" :class="{ 'pt-4': !slots.content }">
      <slot name="footer" />
    </div>
  </div>
</template>
