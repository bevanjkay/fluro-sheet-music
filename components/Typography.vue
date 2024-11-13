<script setup lang="ts">
const props = defineProps<{
    variant: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | string,
    size: "heading-xl" | "heading-lg" | "heading-md" | "heading-sm" | "heading-xs" | "text" | string
}>();

const CLASS_LOOKUP = {
    "heading-xl": "text-5xl font-bold mb-4 tracking-tight",
    "heading-lg": "text-3xl font-bold tracking-tight",
    "heading-md": "text-2xl font-bold tracking-tight",
    "heading-sm": "text-xl font-bold",
    "heading-xs": "text-lg font-bold",
    "text": "text-base font-normal",
} as Record<string, string>;

const classes = computed(() => {
    return CLASS_LOOKUP[props.size];
});
</script>


<template>
    <component :is="variant" :class="classes">
        <slot />
    </component>
</template>