// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PDFDocumentProxy } from "pdfjs-dist";

type CacheModule = typeof import("~/utils/pdfDocumentCache");

const buildDoc = (numPages = 3) => ({
  numPages,
  destroy: vi.fn(async () => {}),
}) as unknown as PDFDocumentProxy & { destroy: ReturnType<typeof vi.fn> };

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("pdf document cache", () => {
  let cacheModule: CacheModule;

  beforeEach(async () => {
    vi.resetModules();
    cacheModule = await import("~/utils/pdfDocumentCache");
  });

  it("shares a single load between concurrent acquires of the same source", async () => {
    const doc = buildDoc();
    const load = vi.fn(async () => doc);

    const first = cacheModule.acquirePdfDocument("doc-1", load);
    const second = cacheModule.acquirePdfDocument("doc-1", load);

    expect(load).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
    expect(first.refCount).toBe(2);

    await flushPromises();
    expect(first.numPages).toBe(3);
  });

  it("destroys evicted documents that are no longer in use", async () => {
    const docs = Array.from({ length: 21 }, () => buildDoc());
    const entries = docs.map((doc, index) =>
      cacheModule.acquirePdfDocument(`doc-${index}`, async () => doc),
    );
    entries.forEach((entry) => cacheModule.releasePdfDocument(entry));
    await flushPromises();

    // Loading a 21st document evicts the oldest
    expect(docs[0]!.destroy).toHaveBeenCalledTimes(1);
    expect(docs[1]!.destroy).not.toHaveBeenCalled();
    expect(cacheModule.getCachedPdfDocument("doc-0")).toBeUndefined();
    expect(cacheModule.getCachedPdfDocument("doc-20")).toBeDefined();
  });

  it("defers destroying an evicted document until its last render releases it", async () => {
    const inUseDoc = buildDoc();
    const inUseEntry = cacheModule.acquirePdfDocument("doc-0", async () => inUseDoc);

    for (let index = 1; index <= 20; index++) {
      const entry = cacheModule.acquirePdfDocument(`doc-${index}`, async () => buildDoc());
      cacheModule.releasePdfDocument(entry);
    }
    await flushPromises();

    // Evicted while still rendering: not destroyed yet
    expect(cacheModule.getCachedPdfDocument("doc-0")).toBeUndefined();
    expect(inUseDoc.destroy).not.toHaveBeenCalled();

    cacheModule.releasePdfDocument(inUseEntry);
    await flushPromises();

    expect(inUseDoc.destroy).toHaveBeenCalledTimes(1);
  });

  it("drops failed loads so a later acquire can retry", async () => {
    const failingLoad = vi.fn(async () => {
      throw new Error("network error");
    });

    const entry = cacheModule.acquirePdfDocument("doc-1", failingLoad);
    await expect(entry.promise).rejects.toThrow("network error");
    await flushPromises();

    expect(cacheModule.getCachedPdfDocument("doc-1")).toBeUndefined();

    const doc = buildDoc();
    const retry = cacheModule.acquirePdfDocument("doc-1", async () => doc);
    await expect(retry.promise).resolves.toBe(doc);
  });
});
