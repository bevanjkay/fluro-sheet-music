<script lang="ts" setup>
import { useStorage } from "@vueuse/core";

const songStore = useSongStore();
const sheetStore = useSheetStore();
const toast = useToast();

const vertical: Ref<boolean> = useStorage("vertical", false);

const verticalOptions = [
  { name: "Vertical", value: true },
  { name: "Horizontal", value: false },
];

const darkModeOptions = [
  { name: "Light", value: false },
  { name: "Dark", value: true },
];

const darkMode: Ref<boolean> = useStorage("darkMode", false);

const keySelection: Ref<Record<string, string>> = useStorage("keys", {});

const clearCache = () => {
  songStore.clearCache();
  songStore.getSongs();
  sheetStore.clearCache();
  sheetStore.getSheets();
  
  // Also clear expired entries
  clearExpiredCache();
  
  toast.add({
    severity: "success",
    summary: "Cache Cleared",
    detail: "All cached data has been cleared and reloaded.",
    life: 3000,
  });
  
  reloadNuxtApp();
};

// Get current localStorage usage for display
const storageSize = ref("0 KB");
const updateStorageSize = () => {
  const size = getLocalStorageSize();
  storageSize.value = `${Math.round(size / 1024)} KB`;
};

onMounted(() => {
  updateStorageSize();
});
</script>

<template>
  <div>
    <div class="flex flex-col gap-4">
    <Typography size="heading-lg" variant="h3">Options</Typography>
    <div class="flex flex-col gap-3">
      <div v-for="song in songStore.state.populatedSongs" :key="song._id" class="flex flex-col gap-1">
        <label :for="song._id"><strong>{{ song.title }}</strong></label>
        <Select
v-model="keySelection[song._id]" :options="song.sheetMusic" option-label="title" option-value="_id"
          placeholder="Select a Key" class="w-full " />
      </div>
    </div>
      <div>
        <label><strong>Scroll Direction</strong></label><br>
        <SelectButton v-model="vertical" :options="verticalOptions" option-label="name" option-value="value" />
      </div>
      <div>
        <label><strong>Dark Mode</strong></label><br>
        <SelectButton v-model="darkMode" :options="darkModeOptions" option-label="name" option-value="value" />
      </div>
      <div class="flex flex-col gap-2">
        <label><strong>Storage</strong></label>
        <p class="text-sm text-gray-600 dark:text-gray-400">Current cache size: {{ storageSize }}</p>
        <Button class="w-fit" label="Clear Cache" severity="secondary" @click="clearCache" />
      </div>
    </div>

  </div>
</template>

<style>
.p-dialog {
  width: clamp(200px, 95vw, 600px);
}
</style>