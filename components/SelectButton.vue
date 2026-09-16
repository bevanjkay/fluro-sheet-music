<script setup lang="ts">
type OptionValue = string | number | boolean;
type Option = Record<string, unknown>;

const props = withDefaults(defineProps<{
  modelValue?: OptionValue
  options?: Option[]
  optionLabel?: string
  optionValue?: string
  disabled?: boolean
}>(), {
  modelValue: undefined,
  options: () => [],
  optionLabel: "label",
  optionValue: "value",
  disabled: false,
});

const emit = defineEmits<{ (e: "update:modelValue", value: OptionValue): void }>();

const valueOf = (option: Option) => option[props.optionValue] as OptionValue;
const labelOf = (option: Option) => String(option[props.optionLabel]);
</script>

<template>
  <div class="inline-flex rounded-md border border-zinc-300 p-0.5 dark:border-zinc-600" role="group">
    <button
      v-for="option in options"
      :key="String(valueOf(option))"
      type="button"
      :disabled="disabled"
      :aria-pressed="modelValue === valueOf(option)"
      class="rounded px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:opacity-60"
      :class="modelValue === valueOf(option)
        ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
        : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'"
      @click="emit('update:modelValue', valueOf(option))"
    >
      {{ labelOf(option) }}
    </button>
  </div>
</template>
