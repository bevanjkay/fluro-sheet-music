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
  shouldLoad: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits<{
  (e: "data", value: { id: string, numPages: number }): void
}>();

const user: RemovableRef<User> = useStorage("_fluro_user", { token: "", refreshToken: "" });

// State for the rendered image
const imageDataUrl = ref<string | null>(null);
const isLoading = ref(false);
const hasError = ref(false);

// Track if we've emitted page count
const hasEmittedData = ref(false);

// Calculate available viewport height accounting for header
const getAvailableHeight = () => {
  // Account for header (approximately 70px with padding) and some margin
  const headerHeight = 80;
  return window.innerHeight - headerHeight;
};

// Render PDF page to image
const renderPdfToImage = async () => {
  if (!props.shouldLoad || !props.source) {
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
    
    // Emit the total page count once
    if (!hasEmittedData.value) {
      emit("data", { id: props.song, numPages: pdfDoc.numPages });
      hasEmittedData.value = true;
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
  () => [props.source, props.page, props.shouldLoad, user.value.token],
  () => {
    if (props.shouldLoad) {
      renderPdfToImage();
    } else {
      // Clear the image when not visible to save memory
      imageDataUrl.value = null;
    }
  },
  { immediate: true }
);

// Handle window resize to re-render at appropriate size
const handleResize = () => {
  if (props.shouldLoad && imageDataUrl.value) {
    renderPdfToImage();
  }
};

let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
const debouncedResize = () => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  resizeTimeout = setTimeout(handleResize, 300);
};

onMounted(() => {
  window.addEventListener("resize", debouncedResize);
});

// Reset emission tracking when song changes
watch(() => props.song, () => {
  hasEmittedData.value = false;
});

// Clean up on unmount
onBeforeUnmount(() => {
  imageDataUrl.value = null;
  window.removeEventListener("resize", debouncedResize);
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
});

</script>

<template>
  <div class="pdf-render-container" style="min-height: 100vh; padding-top: 80px; display: flex; align-items: center; justify-content: center; background: #f5f5f5;">
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
      style="max-width: 100vw; max-height: calc(100vh - 80px); width: auto; height: auto; object-fit: contain;"
    >
    <div v-else-if="!shouldLoad" style="opacity: 0.5;">
      <p>Slide not loaded</p>
    </div>
  </div>
</template>
