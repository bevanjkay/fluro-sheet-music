<script lang="ts" setup>
import { useStorage } from "@vueuse/core";
import type { RemovableRef } from "@vueuse/core";
import * as pdfjsLib from "pdfjs-dist";

// Set up the worker - use local worker file from pdfjs-dist package
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}

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
  sheetId: {
    type: String,
    default: "",
  },
});

const emit = defineEmits<{
  (e: "data", value: { id: string, numPages: number, sheetId: string }): void
}>();

const user: RemovableRef<User> = useStorage("_fluro_user", { token: "", refreshToken: "" });

// State for the rendered image
const imageDataUrl = ref<string | null>(null);
const isLoading = ref(false);
const hasError = ref(false);

// Track if we've emitted page count for this specific sheet
const hasEmittedData = ref(false);
const lastEmittedSheet = ref("");

// Calculate available viewport height accounting for header
const HEADER_HEIGHT = 80; // Header height including padding and margins

const getAvailableHeight = () => {
  return window.innerHeight - HEADER_HEIGHT;
};

// Computed styles using the constant
const containerStyle = computed(() => ({
  minHeight: "100vh",
  paddingTop: `${HEADER_HEIGHT}px`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f5f5f5"
}));

const imageStyle = computed(() => ({
  maxWidth: "100vw",
  maxHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
  width: "auto",
  height: "auto",
  objectFit: "contain" as const
}));

// Render PDF page to image
const renderPdfToImage = async () => {
  if (!props.source) {
    imageDataUrl.value = null;
    return;
  }

  isLoading.value = true;
  hasError.value = false;
  let pdfDoc = null;

  try {
    const url = `${props.source}?access_token=${user.value.token}`;
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument(url);
    pdfDoc = await loadingTask.promise;
    
    // Emit the total page count once per sheet
    if (props.sheetId !== lastEmittedSheet.value || !hasEmittedData.value) {
      emit("data", { id: props.song, numPages: pdfDoc.numPages, sheetId: props.sheetId });
      hasEmittedData.value = true;
      lastEmittedSheet.value = props.sheetId;
    }

    // Get the specific page
    const page = await pdfDoc.getPage(props.page);
    
    // Calculate scale to fit the viewport, accounting for header
    const viewport = page.getViewport({ scale: 1.0 });
    const availableHeight = getAvailableHeight();
    const availableWidth = window.innerWidth;
    
    const scale = Math.min(
      availableWidth / viewport.width,
      availableHeight / viewport.height,
      2.5 // Max scale for quality
    );
    
    const scaledViewport = page.getViewport({ scale });
    
    // Create canvas
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    
    if (!context) {
      throw new Error("Could not get canvas context");
    }
    
    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;
    
    // Render PDF page to canvas
    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport,
      canvas: canvas,
    };
    
    await page.render(renderContext).promise;
    
    // Convert canvas to image data URL
    imageDataUrl.value = canvas.toDataURL("image/jpeg", 0.92);
    
    // Clean up: destroy the PDF document immediately after rendering
    // This frees memory since we only keep the image
    if (pdfDoc) {
      await pdfDoc.destroy();
    }
    
    isLoading.value = false;
  } catch (error) {
    console.error("Error rendering PDF:", error);
    hasError.value = true;
    isLoading.value = false;
    
    // Clean up on error
    if (pdfDoc) {
      try {
        await pdfDoc.destroy();
      } catch (e) {
        console.warn("Error destroying PDF after error:", e);
      }
    }
  }
};

// Watch for changes that require re-rendering
watch(
  () => [props.source, props.page, props.sheetId, user.value.token],
  () => {
    renderPdfToImage();
  },
  { immediate: true }
);

// Handle window resize to re-render at appropriate size
const handleResize = () => {
  if (imageDataUrl.value) {
    renderPdfToImage();
  }
};

const resizeTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const debouncedResize = () => {
  if (resizeTimeout.value) {
    clearTimeout(resizeTimeout.value);
  }
  resizeTimeout.value = setTimeout(handleResize, 300);
};

onMounted(() => {
  window.addEventListener("resize", debouncedResize);
});

// Reset emission tracking when sheet changes
watch(() => props.sheetId, () => {
  hasEmittedData.value = false;
});

// Clean up on unmount
onBeforeUnmount(() => {
  imageDataUrl.value = null;
  window.removeEventListener("resize", debouncedResize);
  if (resizeTimeout.value) {
    clearTimeout(resizeTimeout.value);
  }
});

</script>

<template>
  <div class="pdf-render-container" :style="containerStyle">
    <div v-if="isLoading" style="text-align: center;">
      <ProgressSpinner />
      <p style="opacity: 0.7; margin-top: 1rem;">Loading PDF...</p>
    </div>
    <div v-else-if="hasError" style="text-align: center; color: #dc2626; padding: 2rem;">
      <p>Error loading PDF page</p>
    </div>
    <img
      v-else-if="imageDataUrl"
      :src="imageDataUrl"
      alt="PDF Page"
      :style="imageStyle"
    >
  </div>
</template>
