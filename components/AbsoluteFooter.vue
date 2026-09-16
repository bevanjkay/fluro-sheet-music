<template>
  <!-- A credit line, not an alert: Message would announce it to screen readers. -->
  <footer class="pointer-events-none mt-16 flex justify-center sm:absolute sm:bottom-4 sm:right-6 sm:mt-0 sm:justify-end">
    <p class="pointer-events-auto text-xs text-zinc-500 dark:text-zinc-400">
      <slot />
    </p>
  </footer>
</template>
