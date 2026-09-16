<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: string
  size?: "small" | "normal" | "large"
  variant?: "outlined" | "filled"
  disabled?: boolean
}>(), {
  modelValue: "",
  size: "normal",
  variant: "outlined",
  disabled: false,
});

const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();
</script>

<template>
  <InputText
    type="password"
    :model-value="modelValue"
    :size="size"
    :variant="variant"
    :disabled="disabled"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
