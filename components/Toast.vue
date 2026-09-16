<script setup lang="ts">
import type { ToastSeverity } from "@/composables/useToast";

const { messages, remove } = useToast();

const TONES: Record<ToastSeverity, string> = {
  success: "border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100",
  info: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100",
  warn: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
  error: "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100",
};

const ICONS: Record<ToastSeverity, string> = {
  success: "check",
  info: "list",
  warn: "exclamation-triangle",
  error: "times-circle",
};
</script>

<template>
  <div class="pointer-events-none fixed right-4 top-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
    <TransitionGroup
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-x-4 opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="translate-x-4 opacity-0"
    >
      <div
        v-for="message in messages"
        :key="message.id"
        class="pointer-events-auto flex items-start gap-2 rounded-lg border px-4 py-3 shadow-md"
        :class="TONES[message.severity]"
        role="status"
        aria-live="polite"
      >
        <AppIcon :name="ICONS[message.severity]" :size="16" class="mt-0.5" />
        <div class="min-w-0 flex-1">
          <p v-if="message.summary" class="text-sm font-semibold">{{ message.summary }}</p>
          <p v-if="message.detail" class="text-sm opacity-90">{{ message.detail }}</p>
        </div>
        <button
          type="button"
          class="rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
          aria-label="Dismiss notification"
          @click="remove(message.id)"
        >
          <AppIcon name="times" :size="14" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
