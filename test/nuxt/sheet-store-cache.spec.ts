import { nextTick, ref } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { useSheetStore } from "~/stores/useSheetStore";

const useAsyncFluroDataMock = vi.hoisted(() => vi.fn());

mockNuxtImport("useAsyncFluroData", () => useAsyncFluroDataMock);

const buildSheet = (id: string, title: string): Sheet => ({
  _id: id,
  title,
  data: {
    key: title.slice(0, 1),
  },
});

describe("useSheetStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useAsyncFluroDataMock.mockReset();
    localStorage.setItem("_fluro_user", JSON.stringify({ token: "test-token", refreshToken: "" }));
  });

  it("uses cached sheets when the cache is still valid", async () => {
    const cachedSheets = [buildSheet("sheet-1", "A Sheet")];
    localStorage.setItem("persistedSheets", JSON.stringify(cachedSheets));
    localStorage.setItem("persistedSheetsExpiry", JSON.stringify(Date.now() + 60_000));

    const store = useSheetStore();
    await store.getSheets();

    expect(store.state.sheets).toEqual(cachedSheets);
    expect(useAsyncFluroDataMock).not.toHaveBeenCalled();
  });

  it("fetches and persists sheets when the cache is expired", async () => {
    const fetchedSheets = [buildSheet("sheet-2", "B Sheet")];
    localStorage.setItem("persistedSheets", JSON.stringify([buildSheet("sheet-old", "Old Sheet")]));
    localStorage.setItem("persistedSheetsExpiry", JSON.stringify(Date.now() - 60_000));
    useAsyncFluroDataMock.mockResolvedValue({
      data: ref(fetchedSheets),
    });

    const store = useSheetStore();
    await store.getSheets();
    await nextTick();

    expect(useAsyncFluroDataMock).toHaveBeenCalledWith("sheetMusic");
    expect(store.state.sheets).toEqual(fetchedSheets);
    expect(JSON.parse(localStorage.getItem("persistedSheets") || "[]")).toEqual(fetchedSheets);
    expect(Number(localStorage.getItem("persistedSheetsExpiry"))).toBeGreaterThan(Date.now());
    expect(store.getSheet("sheet-2")).toEqual(fetchedSheets[0]);
  });

  it("skips persisting oversized sheet lists and clears cached sheets on demand", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const store = useSheetStore();
    const largeSheetList = Array.from({ length: 2000 }, (_, index) => buildSheet(`sheet-${index}`, `Sheet ${index}`));

    store.state.sheets = largeSheetList;
    await nextTick();

    expect(JSON.parse(localStorage.getItem("persistedSheets") || "[]")).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith("Sheet list too large to cache, skipping localStorage");

    localStorage.setItem("persistedSheets", JSON.stringify([buildSheet("sheet-cache", "Cached Sheet")]));
    localStorage.setItem("persistedSheetsExpiry", JSON.stringify(Date.now() + 60_000));

    store.clearCache();
    await nextTick();

    expect(JSON.parse(localStorage.getItem("persistedSheets") || "[]")).toEqual([]);

    warnSpy.mockRestore();
  });
});
