<script setup lang="ts">
const { userAgent } = useDevice();

const legacyBrowser = computed(() => {
  return /Safari/.test(userAgent) && /Version\/(15|14|13|12|11)\.\d+\.\d+/.test(userAgent);
});

const go = () => {
  navigateTo("https://legacysheets.gc.org.au", { external: true });
};
</script>

<template>
<Message v-if="legacyBrowser" size="medium" severity="warn" style="margin-bottom: 2em; padding: 1em;">
    <template #icon>
      <i class="pi pi-exclamation-triangle" style="font-size: 4rem; margin-right: 1rem;" />
  </template>
    <h3 class="text-xl bold">Warning!</h3>
    <p>It looks like you are using an older device. You will likely have a better experience using
      https://legacysheets.gc.org.au - but please note there are not as many features.</p>
      <Button severity="warn" label="Go to Legacy Sheets" class="mt-2" @click="go" />
  </Message>
  </template>