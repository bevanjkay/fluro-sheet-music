<script lang="ts" setup>
import { useStorage  } from "@vueuse/core";
import type {RemovableRef} from "@vueuse/core";
import { VuePDF, usePDF } from "@tato30/vue-pdf";

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

// Add error handling for PDF loading
const pdfError = ref(false);
const isLoading = ref(true);

const { pdf, pages } = usePDF(source);

// Track if we've already emitted data for this song to prevent duplicate emissions
const hasEmittedData = ref(false);
const lastEmittedSong = ref("");

// Watch for successful PDF loading
watch(pdf, (newPdf) => {
  if (newPdf) {
    isLoading.value = false;
    pdfError.value = false;
  }
}, { immediate: true });

// More efficient watcher that prevents duplicate emissions
watch(pages, (newPages: number) => {
  if (newPages > 0 && (props.song !== lastEmittedSong.value || !hasEmittedData.value)) {
    emit("data", { id: props.song, numPages: newPages });
    hasEmittedData.value = true;
    lastEmittedSong.value = props.song;
    isLoading.value = false;
  }
});

// Reset the emission flag when the song changes
watch(() => props.song, () => {
  hasEmittedData.value = false;
  isLoading.value = true;
  pdfError.value = false;
});

// Set a timeout to detect loading failures
onMounted(() => {
  setTimeout(() => {
    if (isLoading.value && !pdf.value) {
      pdfError.value = true;
      isLoading.value = false;
    }
  }, 10000); // 10 second timeout
});

</script>

<template>
  <div v-if="pdfError" class="p-12 relative min-h-dvh pt-24 text-center">
    <i class="pi pi-exclamation-triangle text-6xl text-red-500 mb-4"/>
    <h3 class="text-xl font-bold mb-2">PDF Loading Error</h3>
    <p class="mb-4">This PDF could not be displayed on your device.</p>
    <p class="text-sm text-gray-600 mb-4">
      This may be due to your device not supporting modern PDF features. 
      Try using a more recent browser or device, or visit the legacy version of this site.
    </p>
    <Button 
      label="Go to Legacy Sheets" 
      icon="pi pi-external-link" 
      severity="secondary" 
      @click="navigateTo('https://legacysheets.gc.org.au', { external: true })"
    />
  </div>
  <div v-else-if="isLoading" class="p-12 relative min-h-dvh pt-24 text-center">
    <ProgressSpinner />
    <p class="mt-4">Loading PDF...</p>
  </div>
  <VuePDF v-else :key="key" :pdf="pdf" intent="display" :page="page" fit-parent />
</template>
