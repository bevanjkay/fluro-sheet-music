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

const keyOptions = (song: PopulatedSong) =>
  (song.sheetMusic || []).map(sheet => ({
    _id: sheet._id,
    label: sheet.data?.key || sheet.title,
  }));

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
  <div class="flex flex-col gap-6">
    <Typography size="heading-md" variant="h2">Options</Typography>

    <section v-if="songStore.state.populatedSongs.length" class="flex flex-col gap-3">
      <h3 class="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Keys</h3>
      <div v-for="song in songStore.state.populatedSongs" :key="song._id" class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-zinc-900 dark:text-zinc-50">{{ song.title }}</span>
        <Select
          v-model="keySelection[song._id]"
          :options="keyOptions(song)"
          option-label="label"
          option-value="_id"
          :aria-label="`Key for ${song.title}`"
          placeholder="Select a key"
          class="w-full"
        />
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <h3 class="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Display</h3>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <span class="text-sm font-medium text-zinc-900 dark:text-zinc-50">Scroll direction</span>
        <SelectButton
          v-model="vertical"
          :options="verticalOptions"
          option-label="name"
          option-value="value"
          aria-label="Scroll direction"
        />
      </div>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <span class="text-sm font-medium text-zinc-900 dark:text-zinc-50">Appearance</span>
        <SelectButton
          v-model="darkMode"
          :options="darkModeOptions"
          option-label="name"
          option-value="value"
          aria-label="Appearance"
        />
      </div>
    </section>

    <section class="flex flex-col gap-2 border-t border-zinc-200 pt-5 dark:border-zinc-800">
      <h3 class="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Storage</h3>
      <p class="text-sm text-zinc-600 dark:text-zinc-400">
        Cached songs and sheets use {{ storageSize }}. Clearing reloads them from Fluro.
      </p>
      <Button class="w-fit" label="Clear cache" severity="secondary" @click="clearCache" />
    </section>
  </div>
</template>
