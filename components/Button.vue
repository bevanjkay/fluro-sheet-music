<script setup lang="ts">
import { NuxtLink } from "#components";

type Severity = "primary" | "secondary" | "danger";

const props = withDefaults(defineProps<{
  label?: string
  icon?: string
  severity?: Severity
  variant?: "solid" | "text"
  outlined?: boolean
  rounded?: boolean
  size?: "small" | "normal" | "large"
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  to?: string
}>(), {
  label: undefined,
  icon: undefined,
  severity: "primary",
  variant: "solid",
  outlined: false,
  rounded: false,
  size: "normal",
  disabled: false,
  type: "button",
  to: undefined,
});

const slots = useSlots();

const iconOnly = computed(() => Boolean(props.icon) && !props.label && !slots.default);

// Minimum heights keep every control at a comfortable touch target; this app
// is used on an iPad by people holding an instrument.
const SIZES: Record<string, string> = {
  small: "text-xs gap-1.5 min-h-[36px]",
  normal: "text-sm gap-2 min-h-[44px]",
  large: "text-base gap-2 min-h-[48px]",
};

const PADDING: Record<string, string> = {
  small: "px-2.5 py-1.5",
  normal: "px-4 py-2",
  large: "px-5 py-2.5",
};

const ICON_PADDING: Record<string, string> = {
  small: "p-1.5 min-w-[36px]",
  normal: "p-2 min-w-[44px]",
  large: "p-2.5 min-w-[48px]",
};

const SOLID: Record<Severity, string> = {
  primary: "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200",
  secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const OUTLINED: Record<Severity, string> = {
  primary: "border border-zinc-900 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-50 dark:text-zinc-50 dark:hover:bg-zinc-800",
  secondary: "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800",
  danger: "border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950",
};

const TEXT: Record<Severity, string> = {
  primary: "text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-800",
  secondary: "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
  danger: "text-red-600 hover:bg-red-50 dark:hover:bg-red-950",
};

const classes = computed(() => {
  const tone = props.variant === "text"
    ? TEXT[props.severity]
    : props.outlined
      ? OUTLINED[props.severity]
      : SOLID[props.severity];

  return [
    "inline-flex items-center justify-center font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2",
    "disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none",
    "dark:focus-visible:ring-offset-zinc-900",
    props.rounded ? "rounded-full" : "rounded-md",
    SIZES[props.size],
    iconOnly.value ? ICON_PADDING[props.size] : PADDING[props.size],
    tone,
  ];
});

const iconSize = computed(() => (props.size === "large" ? 18 : 16));
</script>

<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :type="to ? undefined : type"
    :disabled="to ? undefined : disabled"
    :class="classes"
  >
    <AppIcon v-if="icon" :name="icon" :size="iconSize" />
    <slot>{{ label }}</slot>
  </component>
</template>
