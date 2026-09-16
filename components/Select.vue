<script setup lang="ts">
type Option = Record<string, unknown> | string;

const props = withDefaults(defineProps<{
  modelValue?: string
  options?: Option[]
  optionLabel?: string
  optionValue?: string
  placeholder?: string
  disabled?: boolean
  ariaLabel?: string
}>(), {
  modelValue: undefined,
  options: () => [],
  optionLabel: undefined,
  optionValue: undefined,
  placeholder: "Select an option",
  disabled: false,
  ariaLabel: undefined,
});

const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();

const valueOf = (option: Option): string =>
  typeof option === "string" ? option : String(option[props.optionValue ?? "value"]);

const labelOf = (option: Option): string =>
  typeof option === "string" ? option : String(option[props.optionLabel ?? "label"]);

const selectedLabel = computed(() => {
  const match = props.options.find(option => valueOf(option) === props.modelValue);
  return match ? labelOf(match) : undefined;
});
</script>

<template>
  <SelectRoot
    :model-value="modelValue"
    :disabled="disabled"
    @update:model-value="emit('update:modelValue', $event as string)"
  >
    <SelectTrigger
      :aria-label="ariaLabel"
      class="inline-flex min-h-[44px] w-full items-center justify-between gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
    >
      <SelectValue :placeholder="placeholder">
        <span :class="{ 'text-zinc-500 dark:text-zinc-400': !selectedLabel }">
          {{ selectedLabel ?? placeholder }}
        </span>
      </SelectValue>
      <AppIcon name="chevron-down" :size="16" class="text-zinc-500" />
    </SelectTrigger>

    <SelectPortal>
      <SelectContent
        position="popper"
        :side-offset="4"
        class="z-50 max-h-60 min-w-[var(--reka-select-trigger-width)] overflow-hidden rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
      >
        <SelectViewport class="p-1">
          <SelectItem
            v-for="option in options"
            :key="valueOf(option)"
            :value="valueOf(option)"
            class="relative flex cursor-pointer select-none items-center rounded px-2 py-1.5 pr-7 text-sm text-zinc-900 outline-none data-[highlighted]:bg-zinc-100 dark:text-zinc-50 dark:data-[highlighted]:bg-zinc-700"
          >
            <SelectItemText>{{ labelOf(option) }}</SelectItemText>
            <SelectItemIndicator class="absolute right-2">
              <AppIcon name="check" :size="14" />
            </SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
