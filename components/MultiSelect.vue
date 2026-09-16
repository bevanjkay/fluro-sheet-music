<script setup lang="ts" generic="T extends object">
const props = withDefaults(defineProps<{
  modelValue?: T[]
  options?: T[]
  optionLabel?: string
  placeholder?: string
  filter?: boolean
  disabled?: boolean
}>(), {
  modelValue: () => [] as T[],
  options: () => [] as T[],
  optionLabel: "label",
  placeholder: "Select options",
  filter: false,
  disabled: false,
});

const emit = defineEmits<{ (e: "update:modelValue", value: T[]): void }>();

const field = (option: T, key: string): unknown => (option as Record<string, unknown>)[key];

const labelOf = (option: T): string => String(field(option, props.optionLabel));

const keyOf = (option: T): string => String(field(option, "_id") ?? labelOf(option));

const onUpdate = (value: unknown): void => {
  emit("update:modelValue", Array.isArray(value) ? value as T[] : []);
};

const triggerLabel = computed(() => {
  const count = props.modelValue.length;
  if (count === 0) return props.placeholder;
  if (count === 1) return labelOf(props.modelValue[0]!);
  return `${count} selected`;
});
</script>

<template>
  <ComboboxRoot
    multiple
    by="_id"
    :model-value="modelValue"
    :disabled="disabled"
    class="relative"
    @update:model-value="onUpdate"
  >
    <ComboboxAnchor>
      <ComboboxTrigger
        class="inline-flex w-full min-w-[16rem] items-center justify-between gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
      >
        <span :class="{ 'text-zinc-500 dark:text-zinc-400': modelValue.length === 0 }">{{ triggerLabel }}</span>
        <AppIcon name="chevron-down" :size="16" class="text-zinc-500" />
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxPortal>
      <ComboboxContent
        position="popper"
        :side-offset="4"
        class="z-50 max-h-72 w-[var(--reka-combobox-trigger-width)] overflow-hidden rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
      >
        <div v-if="filter" class="flex items-center gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
          <AppIcon name="search" :size="14" class="text-zinc-500" />
          <ComboboxInput
            placeholder="Search..."
            class="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50"
          />
        </div>

        <ComboboxViewport class="max-h-56 overflow-y-auto p-1">
          <ComboboxEmpty class="px-2 py-3 text-center text-sm text-zinc-500">
            No results found
          </ComboboxEmpty>
          <ComboboxItem
            v-for="option in options"
            :key="keyOf(option)"
            :value="option"
            :text-value="labelOf(option)"
            class="relative flex cursor-pointer select-none items-center rounded px-2 py-1.5 pr-7 text-sm text-zinc-900 outline-none data-[highlighted]:bg-zinc-100 dark:text-zinc-50 dark:data-[highlighted]:bg-zinc-700"
          >
            {{ labelOf(option) }}
            <ComboboxItemIndicator class="absolute right-2">
              <AppIcon name="check" :size="14" />
            </ComboboxItemIndicator>
          </ComboboxItem>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>
