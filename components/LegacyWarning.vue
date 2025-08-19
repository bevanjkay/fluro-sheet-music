<script setup lang="ts">
const { userAgent } = useDevice();

const legacyBrowser = computed(() => {
  // Check for older Safari versions (11-15)
  const isOlderSafari = /Safari/.test(userAgent) && /Version\/(15|14|13|12|11)\./.test(userAgent);
  
  // Check for older iPad devices that may have issues with modern PDF.js
  const isOlderIpad = /iPad/.test(userAgent) && (
    // iPad with iOS 12 or earlier (Safari 12 and below)
    /OS (12|11|10|9)_/.test(userAgent) ||
    // iPad with older Safari versions regardless of iOS version
    /Version\/(12|11|10|9)\./.test(userAgent)
  );
  
  // Check for devices without WebAssembly support (required for modern PDF.js)
  const lacksModernFeatures = typeof WebAssembly === "undefined";
  
  return isOlderSafari || isOlderIpad || lacksModernFeatures;
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
    <p v-if="/iPad/.test(userAgent)">
      It looks like you are using an older iPad. This device may have issues displaying PDFs with the current version of this app. 
      You will likely have a better experience using https://legacysheets.gc.org.au - but please note there are not as many features.
    </p>
    <p v-else>
      It looks like you are using an older device. You will likely have a better experience using
      https://legacysheets.gc.org.au - but please note there are not as many features.
    </p>
      <Button severity="warn" label="Go to Legacy Sheets" class="mt-2" @click="go" />
  </Message>
  </template>