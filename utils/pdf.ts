import * as pdfjsLib from "pdfjs-dist";
import { useStorage } from "@vueuse/core";
import type { RemovableRef } from "@vueuse/core";

// Configure PDF.js worker - use a more robust approach for different environments
if (typeof window !== "undefined") {
  // In browser environment
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

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
 * Get the number of pages in a PDF without rendering it
 * Uses PDF.js to load only the metadata needed for page count
 */
export async function getPdfPageCount(url: string, sheetId?: string): Promise<number> {
  // Check cache first if we have a sheet ID
  if (sheetId && pdfPageCache.value[sheetId]) {
    const cached = pdfPageCache.value[sheetId];
    const isExpired = Date.now() - cached.timestamp > PDF_CACHE_EXPIRY;
    
    if (!isExpired) {
      return cached.numPages;
    } else {
      // Remove expired cache entry by creating new object without the key
      const { [sheetId]: removedItem, ...newCache } = pdfPageCache.value;
      pdfPageCache.value = newCache;
    }
  }

  try {
    // Load the PDF document without rendering
    const loadingTask = pdfjsLib.getDocument({
      url,
      // Only load what we need for page count
      stopAtErrors: true,
      disableAutoFetch: true,
      disableStream: true,
    });

    // Add a timeout wrapper since PDF.js doesn't have a built-in timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("PDF loading timeout")), 10000);
    });

    const pdf = await Promise.race([loadingTask.promise, timeoutPromise]);
    const numPages = pdf.numPages;

    // Cleanup the PDF document to free memory
    pdf.destroy();

    // Cache the result if we have a sheet ID and it's a reasonable page count
    if (sheetId && numPages > 0 && numPages <= 1000) { // Sanity check
      pdfPageCache.value[sheetId] = {
        numPages,
        timestamp: Date.now(),
      };
    }

    return numPages;
  } catch (error) {
    console.warn(`Error getting PDF page count for ${sheetId || "unknown"}:`, error);
    // Return 1 as fallback to maintain existing behavior
    return 1;
  }
}

/**
 * Pre-fetch page counts for multiple PDFs in the background
 * This can be called when songs/sheets are loaded to populate the cache
 */
export async function prefetchPdfPageCounts(sheets: { _id: string; url: string }[]): Promise<void> {
  // Process PDFs in parallel but limit concurrency to avoid overwhelming the browser
  const CONCURRENCY_LIMIT = 3;
  
  for (let i = 0; i < sheets.length; i += CONCURRENCY_LIMIT) {
    const batch = sheets.slice(i, i + CONCURRENCY_LIMIT);
    
    await Promise.allSettled(
      batch.map(async (sheet) => {
        try {
          await getPdfPageCount(sheet.url, sheet._id);
        } catch (error) {
          console.warn(`Failed to prefetch page count for sheet ${sheet._id}:`, error);
        }
      })
    );
  }
}

/**
 * Get cached page count immediately (synchronous)
 * Returns null if not cached
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