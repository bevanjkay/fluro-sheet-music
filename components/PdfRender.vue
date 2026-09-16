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

// Raster ceiling, not a display size: the image is fitted with CSS, so this
// only bounds how many pixels we ask pdf.js for on high-DPI screens.
const MAX_RASTER_SCALE = 4;
const MIN_RESCALE_DELTA = 0.05;

const surface = ref<HTMLElement | null>(null);
const renderedScale = ref(0);
let renderToken = 0;
const pageSize = ref<{ width: number, height: number } | null>(null);

// Helper to manage rendered-page cache size
function pruneCache(cache: Map<string, unknown>, maxSize: number): void {
  if (cache.size > maxSize) {
    const keysToDelete = Array.from(cache.keys()).slice(0, cache.size - maxSize);
    keysToDelete.forEach(key => cache.delete(key));
  }
}

// Fit the page to the element's own box, not the physical screen. iOS reports
// a non-rotating window.screen and ignores Split View, so screen dimensions
// under-scale the sheet exactly when legibility matters most.
const measureRasterScale = (pageWidth: number, pageHeight: number): number => {
  const box = surface.value;
  const width = box?.clientWidth || window.innerWidth;
  const height = box?.clientHeight || window.innerHeight;
  const fit = Math.min(width / pageWidth, height / pageHeight);
  const dpr = window.devicePixelRatio || 1;
  return Math.min(fit * dpr, MAX_RASTER_SCALE);
};

const renderPdfToImage = async () => {
  if (!props.source) {
    imageDataUrl.value = null;
    return;
  }

  const token = ++renderToken;
  const isStale = () => token !== renderToken;

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
    if (isStale()) return;

    if (props.sheetId !== lastEmittedSheet.value || !hasEmittedData.value) {
      emit("data", { id: props.song, numPages: pdfDoc.numPages, sheetId: props.sheetId });
      hasEmittedData.value = true;
      lastEmittedSheet.value = props.sheetId;
    }

    const page = await pdfDoc.getPage(props.page);
    if (isStale()) return;

    const viewport = page.getViewport({ scale: 1.0 });

    pageSize.value = { width: viewport.width, height: viewport.height };
    const rasterScale = measureRasterScale(viewport.width, viewport.height);
    const pageCacheKey = `${props.source}_${props.page}_${rasterScale.toFixed(2)}`;

    const cached = renderedPageCache.get(pageCacheKey);
    if (cached) {
      imageDataUrl.value = cached;
      renderedScale.value = rasterScale;
      isLoading.value = false;
      return;
    }

    const scaledViewport = page.getViewport({ scale: rasterScale });
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

    // Cache regardless of staleness; the raster is valid for its scale key
    pruneCache(renderedPageCache, MAX_CACHE_SIZE * 3);
    renderedPageCache.set(pageCacheKey, renderedImage);

    if (isStale()) return;

    imageDataUrl.value = renderedImage;
    renderedScale.value = rasterScale;
    isLoading.value = false;
  } catch (error) {
    if (isStale()) return;
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
  }
);

watch(() => props.sheetId, () => {
  hasEmittedData.value = false;
});

// Rotating an iPad or entering Split View changes the box the sheet must fill,
// so re-rasterise when the fit moves enough to be visible.
let resizeTimer: ReturnType<typeof setTimeout> | null = null;
let observer: ResizeObserver | null = null;

const handleResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const previous = renderedScale.value;
    const page = pageSize.value;
    if (!previous || !page) return;

    const next = measureRasterScale(page.width, page.height);
    if (Math.abs(next - previous) / previous < MIN_RESCALE_DELTA) return;

    renderPdfToImage();
  }, 180);
};

onMounted(() => {
  // Render after mount so the surface element can be measured
  renderPdfToImage();

  if (typeof ResizeObserver !== "undefined" && surface.value) {
    observer = new ResizeObserver(handleResize);
    observer.observe(surface.value);
  }
  else {
    window.addEventListener("resize", handleResize);
  }
});

onBeforeUnmount(() => {
  imageDataUrl.value = null;
  if (resizeTimer) clearTimeout(resizeTimer);
  observer?.disconnect();
  window.removeEventListener("resize", handleResize);
});

</script>

<template>
  <div class="pdf-render-surface">
    <div ref="surface" class="pdf-render-fit">
    <!-- Keep the current sheet on screen while re-rasterising after a rotate -->
    <div v-if="isLoading && !imageDataUrl" class="pdf-render-status">
      <ProgressSpinner />
      <p>Loading sheet music...</p>
    </div>
    <div v-else-if="hasError && !imageDataUrl" class="pdf-render-status pdf-render-error">
      <AppIcon name="times-circle" :size="28" />
      <p>This sheet could not be loaded.</p>
      <p class="pdf-render-hint">Check your connection, then swipe away and back to retry.</p>
    </div>
    <img
      v-else-if="imageDataUrl"
      :src="imageDataUrl"
      :alt="`Sheet music page ${page}`"
      class="pdf-render-page"
    >
    </div>
  </div>
</template>

<style scoped>
.pdf-render-surface {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  height: 100vh;
  padding: var(--app-header-height) 0.5rem 0.5rem;
}

/* The measured box: padding lives on the parent so clientHeight here is
   exactly the space the sheet may occupy. */
.pdf-render-fit {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
}

/* Fitting in CSS keeps the sheet filling its box no matter what scale the
   raster happened to use. */
.pdf-render-page {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

.pdf-render-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: rgb(82 82 91);
  text-align: center;
}

.pdf-render-error {
  color: rgb(185 28 28);
}

.pdf-render-hint {
  font-size: 0.875rem;
  opacity: 0.75;
}
</style>
