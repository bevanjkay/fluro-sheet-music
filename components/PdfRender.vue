<script lang="ts" setup>
import { useStorage } from "@vueuse/core";
import type { RemovableRef } from "@vueuse/core";
import * as pdfjsLib from "pdfjs-dist";

// Use CDN for worker - v3.x for Safari 14 compatibility
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
}

// Module-level cache for rendered pages; documents are cached in utils/pdfDocumentCache
const renderedPageCache = new Map<string, string>();
const MAX_CACHE_SIZE = 20;

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

const imageDataUrl = ref<string | null>(null);
const isLoading = ref(false);
const hasError = ref(false);
const hasEmittedData = ref(false);
const lastEmittedSheet = ref("");

const HEADER_HEIGHT = 80;
const MAX_SCALE = 2.5;

// Helper to manage rendered-page cache size
function pruneCache(cache: Map<string, unknown>, maxSize: number): void {
  if (cache.size > maxSize) {
    const keysToDelete = Array.from(cache.keys()).slice(0, cache.size - maxSize);
    keysToDelete.forEach(key => cache.delete(key));
  }
}

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

const renderPdfToImage = async () => {
  if (!props.source) {
    imageDataUrl.value = null;
    return;
  }

  // Check rendered page cache first
  const pageCacheKey = `${props.source}_${props.page}`;
  if (renderedPageCache.has(pageCacheKey)) {
    imageDataUrl.value = renderedPageCache.get(pageCacheKey)!;

    // Still need to emit data if sheet changed
    if (props.sheetId !== lastEmittedSheet.value || !hasEmittedData.value) {
      const cachedEntry = getCachedPdfDocument(props.source);
      if (cachedEntry?.numPages !== undefined) {
        emit("data", { id: props.song, numPages: cachedEntry.numPages, sheetId: props.sheetId });
        hasEmittedData.value = true;
        lastEmittedSheet.value = props.sheetId;
      }
    }
    return;
  }

  isLoading.value = true;
  hasError.value = false;

  // Hold a reference while rendering so an evicted document isn't
  // destroyed mid-render; released in the finally block below
  const entry = acquirePdfDocument(props.source, () => {
    const url = `${props.source}?access_token=${user.value.token}`;
    // isEvalSupported: false mitigates CVE-2024-4367 while staying on v3.x for Safari 14
    return pdfjsLib.getDocument({ url, isEvalSupported: false }).promise;
  });

  try {
    const pdfDoc = await entry.promise;

    if (props.sheetId !== lastEmittedSheet.value || !hasEmittedData.value) {
      emit("data", { id: props.song, numPages: pdfDoc.numPages, sheetId: props.sheetId });
      hasEmittedData.value = true;
      lastEmittedSheet.value = props.sheetId;
    }

    const page = await pdfDoc.getPage(props.page);
    const viewport = page.getViewport({ scale: 1.0 });

    const maxHeight = window.screen.height - HEADER_HEIGHT;
    const maxWidth = window.screen.width;

    const scale = Math.min(
      maxWidth / viewport.width,
      maxHeight / viewport.height,
      MAX_SCALE
    );

    // Account for device pixel ratio for sharper rendering on high-DPI displays (like iPad Retina)
    const pixelRatio = window.devicePixelRatio || 1;
    const scaledViewport = page.getViewport({ scale: scale * pixelRatio });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not get canvas context");
    }

    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;

    await page.render({
      canvasContext: context,
      viewport: scaledViewport,
    }).promise;

    const renderedImage = canvas.toDataURL("image/jpeg", 0.92);
    imageDataUrl.value = renderedImage;

    // Cache the rendered page
    pruneCache(renderedPageCache, MAX_CACHE_SIZE * 3);
    renderedPageCache.set(pageCacheKey, renderedImage);

    isLoading.value = false;
  } catch (error) {
    console.error("Error rendering PDF:", error);
    hasError.value = true;
    isLoading.value = false;
  } finally {
    releasePdfDocument(entry);
  }
};

watch(
  () => [props.source, props.page, props.sheetId, user.value.token],
  () => {
    renderPdfToImage();
  },
  { immediate: true }
);

watch(() => props.sheetId, () => {
  hasEmittedData.value = false;
});

onBeforeUnmount(() => {
  imageDataUrl.value = null;
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
