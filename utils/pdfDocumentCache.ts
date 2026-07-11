import type { PDFDocumentProxy } from "pdfjs-dist";

export interface PdfDocCacheEntry {
  promise: Promise<PDFDocumentProxy>;
  numPages?: number;
  refCount: number;
  evicted: boolean;
}

const MAX_DOC_CACHE_SIZE = 20;

const cache = new Map<string, PdfDocCacheEntry>();

function destroyDocument(entry: PdfDocCacheEntry): void {
  void entry.promise.then(doc => doc.destroy()).catch(() => {});
}

function pruneCache(): void {
  while (cache.size >= MAX_DOC_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey === undefined) {
      return;
    }
    const entry = cache.get(oldestKey)!;
    cache.delete(oldestKey);
    entry.evicted = true;
    // Defer destruction while renders are still using the document
    if (entry.refCount <= 0) {
      destroyDocument(entry);
    }
  }
}

/**
 * Get (or start loading) the PDF document for `source`, incrementing its
 * reference count. Every acquire must be paired with a release once the
 * caller has finished rendering from the document.
 */
export function acquirePdfDocument(source: string, load: () => Promise<PDFDocumentProxy>): PdfDocCacheEntry {
  let entry = cache.get(source);

  if (!entry) {
    pruneCache();
    const created: PdfDocCacheEntry = { promise: load(), refCount: 0, evicted: false };
    created.promise
      .then((doc) => {
        created.numPages = doc.numPages;
      })
      .catch(() => {
        // Drop failed loads so the next acquire can retry
        if (cache.get(source) === created) {
          cache.delete(source);
        }
      });
    cache.set(source, created);
    entry = created;
  }

  entry.refCount++;
  return entry;
}

export function releasePdfDocument(entry: PdfDocCacheEntry): void {
  entry.refCount--;
  if (entry.evicted && entry.refCount <= 0) {
    destroyDocument(entry);
  }
}

export function getCachedPdfDocument(source: string): PdfDocCacheEntry | undefined {
  return cache.get(source);
}
