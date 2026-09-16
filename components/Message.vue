<script setup lang="ts">
type Severity = "secondary" | "info" | "success" | "warning" | "error";

const props = withDefaults(defineProps<{
  severity?: Severity
  icon?: string
  size?: "small" | "normal"
}>(), {
  severity: "info",
  icon: undefined,
  size: "normal",
});

const TONES: Record<Severity, string> = {
  secondary: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
  info: "bg-sky-50 text-sky-900 border-sky-200 dark:bg-sky-950 dark:text-sky-100 dark:border-sky-900",
  success: "bg-green-50 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-100 dark:border-green-900",
  warning: "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-900",
  error: "bg-red-50 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-100 dark:border-red-900",
};

const classes = computed(() => [
  "inline-flex items-start gap-2 rounded-md border",
  props.size === "small" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2.5 text-sm",
  TONES[props.severity],
]);
</script>

<template>
  <div :class="classes" role="alert">
    <AppIcon v-if="icon" :name="icon" :size="16" class="mt-0.5" />
    <div><slot /></div>
  </div>
</template>
