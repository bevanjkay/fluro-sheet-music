import { useStorage } from "@vueuse/core";
import type { RemovableRef } from "@vueuse/core";

interface PdfPageCache {
  [sheetId: string]: {
    numPages: number;
    timestamp: number;
  };
}

// Cache PDF page counts in localStorage with 7-day expiry
const PDF_CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const pdfPageCache: RemovableRef<PdfPageCache> = useStorage("_fluro_pdf_page_cache", {});

/**
 * Cache page count for a sheet (called when page count is discovered)
 */
export function cachePdfPageCount(sheetId: string, numPages: number): void {
  if (sheetId && numPages > 0 && numPages <= 1000) { // Sanity check
    pdfPageCache.value[sheetId] = {
      numPages,
      timestamp: Date.now(),
    };
  }
}

/**
 * Get cached page count immediately (synchronous)
 * Returns null if not cached or expired
 */
export function getCachedPdfPageCount(sheetId: string): number | null {
  const cached = pdfPageCache.value[sheetId];
  if (!cached) {
    return null;
  }

  const isExpired = Date.now() - cached.timestamp > PDF_CACHE_EXPIRY;
  if (isExpired) {
    const { [sheetId]: removedItem, ...newCache } = pdfPageCache.value;
    pdfPageCache.value = newCache;
    return null;
  }

  return cached.numPages;
}

/**
 * Clear the PDF page cache
 */
export function clearPdfPageCache(): void {
  pdfPageCache.value = {};
}