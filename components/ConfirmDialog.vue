<script setup lang="ts">
const { current, accept, reject } = useConfirm();

const open = computed({
  get: () => current.value !== null,
  set: (value: boolean) => {
    if (!value) reject();
  },
});
</script>

<template>
  <AlertDialogRoot v-model:open="open">
    <AlertDialogPortal>
      <AlertDialogOverlay class="fixed inset-0 z-50 bg-black/40" />
      <AlertDialogContent
        class="fixed left-1/2 top-1/2 z-50 w-[min(95vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white p-6 shadow-xl focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
      >
        <div class="flex items-start gap-3">
          <AppIcon
            v-if="current?.icon"
            :name="current.icon"
            :size="22"
            class="mt-0.5 text-amber-500"
          />
          <div class="min-w-0">
            <AlertDialogTitle class="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {{ current?.header ?? "Are you sure?" }}
            </AlertDialogTitle>
            <AlertDialogDescription class="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              {{ current?.message }}
            </AlertDialogDescription>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <AlertDialogCancel as-child>
            <Button severity="secondary" :label="current?.rejectLabel ?? 'Cancel'" @click="reject" />
          </AlertDialogCancel>
          <AlertDialogAction as-child>
            <Button :label="current?.acceptLabel ?? 'Confirm'" @click="accept" />
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
