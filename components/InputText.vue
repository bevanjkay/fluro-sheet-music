<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  type?: string
  size?: "small" | "normal" | "large"
  variant?: "outlined" | "filled"
  disabled?: boolean
  placeholder?: string
}>(), {
  modelValue: "",
  type: "text",
  size: "normal",
  variant: "outlined",
  disabled: false,
  // A non-empty space keeps :placeholder-shown accurate for FloatLabel while
  // rendering nothing; :has() would be cleaner but Safari 14 lacks it.
  placeholder: " ",
});

const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();

const SIZES: Record<string, string> = {
  small: "px-2.5 py-1.5 text-xs",
  normal: "px-3 py-2 text-sm",
  large: "px-3.5 py-2.5 text-base",
};

const classes = computed(() => [
  "w-full rounded-md border transition-colors",
  "text-zinc-900 placeholder:text-transparent dark:text-zinc-50",
  "focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent",
  "disabled:opacity-60 disabled:cursor-not-allowed",
  props.variant === "filled"
    ? "border-transparent bg-zinc-100 dark:bg-zinc-800"
    : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900",
  SIZES[props.size],
]);
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    :disabled="disabled"
    :placeholder="placeholder"
    :class="classes"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  >
</template>
