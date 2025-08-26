<script lang="ts" setup>
import { useStorage } from "@vueuse/core";
import type {RemovableRef} from "@vueuse/core";
import { VuePDF, usePDF } from "@tato30/vue-pdf";
import { cachePdfPageCount } from "~/utils/pdf";

const props = defineProps({
  source: {
    type: String,
    default: "",
  },
  page: {
    type: Number,
    default: 1,
  },
  song: {
    type: String,
    default: "",
  },
});

const emit = defineEmits<{
  (e: "data", value: { id: string, numPages: number }): void
}>();

// Use a stable key based on song ID and source to avoid unnecessary re-renders
const key = computed(() => `${props.song}-${props.source}`);

const user: RemovableRef<User> = useStorage("_fluro_user", { token: "", refreshToken: "" });

const source = computed(() => {
  return `${props.source}?access_token=${user.value.token}`;
});

const { pdf, pages } = usePDF(source);

// Track if we've already emitted data for this song to prevent duplicate emissions
const hasEmittedData = ref(false);
const lastEmittedSong = ref("");

// More efficient watcher that prevents duplicate emissions
watch(pages, (newPages: number) => {
  if (newPages > 0 && (props.song !== lastEmittedSong.value || !hasEmittedData.value)) {
    emit("data", { id: props.song, numPages: newPages });
    hasEmittedData.value = true;
    lastEmittedSong.value = props.song;
    
    // Cache the page count for future use
    // We need to extract the sheet ID from the source URL to cache it properly
    const match = props.source.match(/\/get\/([a-f0-9]{24})/);
    if (match) {
      const sheetId = match[1];
      cachePdfPageCount(sheetId, newPages);
    }
  }
});

// Reset the emission flag when the song changes
watch(() => props.song, () => {
  hasEmittedData.value = false;
});

</script>

<template>
  <VuePDF :key="key" :pdf="pdf" intent="display" :page="page" fit-parent />
</template>
