<script setup lang="ts">
const { current, close } = useDialog();

const open = computed({
  get: () => current.value !== null,
  set: (value: boolean) => {
    if (!value) close();
  },
});
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/40" />
      <DialogContent
        class="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[clamp(200px,95vw,600px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-6 shadow-xl focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
      >
        <DialogTitle class="sr-only">Options</DialogTitle>
        <DialogDescription class="sr-only">Application display and storage options</DialogDescription>
        <DialogClose
          class="absolute right-4 top-4 rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          aria-label="Close dialog"
        >
          <AppIcon name="times" :size="18" />
        </DialogClose>
        <component :is="current.component" v-if="current" v-bind="current.props" />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
