import { ref } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { useSongStore } from "~/stores/useSongStore";
import { useSheetStore } from "~/stores/useSheetStore";
import { useServiceStore } from "~/stores/useServiceStore";

const useAsyncFluroDataMock = vi.hoisted(() => vi.fn());

mockNuxtImport("useAsyncFluroData", () => useAsyncFluroDataMock);

// useAsyncFluroData short-circuits to `{ data: [], error }` when there is no
// token, so `data.value` is undefined rather than a ref of rows.
const UNAUTHENTICATED = { data: [], error: "User not logged in" };

describe("stores tolerate an unusable response", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useAsyncFluroDataMock.mockReset();
    localStorage.clear();
  });

  it("keeps songs as an array when the request returns no data", async () => {
    useAsyncFluroDataMock.mockResolvedValue(UNAUTHENTICATED);

    const store = useSongStore();
    await store.getSongs();

    expect(Array.isArray(store.state.songs)).toBe(true);
    expect(store.state.songs).toEqual([]);
  });

  it("keeps sheets as an array when the request returns no data", async () => {
    useAsyncFluroDataMock.mockResolvedValue(UNAUTHENTICATED);

    const store = useSheetStore();
    await store.getSheets();

    expect(Array.isArray(store.state.sheets)).toBe(true);
    expect(store.getSheet("missing")).toBeUndefined();
  });

  it("keeps services as an array when the request returns no data", async () => {
    useAsyncFluroDataMock.mockResolvedValue(UNAUTHENTICATED);

    const store = useServiceStore();
    await store.getServices();

    expect(Array.isArray(store.state.services)).toBe(true);
    expect(store.state.services).toEqual([]);
  });

  it("records a failure so an error is not shown as an empty list", async () => {
    useAsyncFluroDataMock.mockRejectedValue(new Error("Network down"));

    const store = useServiceStore();
    await store.getServices();

    expect(store.state.services).toEqual([]);
    expect(store.state.error).toBe("Network down");
  });

  it("clears a previous failure on a successful retry", async () => {
    const store = useServiceStore();

    useAsyncFluroDataMock.mockRejectedValueOnce(new Error("Network down"));
    await store.getServices();
    expect(store.state.error).toBe("Network down");

    useAsyncFluroDataMock.mockResolvedValue({
      data: ref([{ _id: "s1", title: "Sunday", startDate: "2026-01-01", plans: [{ _id: "p1", title: "Main" }] }]),
    });
    await store.getServices();

    expect(store.state.error).toBeNull();
    expect(store.state.services).toHaveLength(1);
  });

  it("skips services that have no plans attached", async () => {
    useAsyncFluroDataMock.mockResolvedValue({
      data: ref([
        { _id: "with-plans", title: "Sunday", startDate: "2026-01-01", plans: [{ _id: "p1", title: "Main" }] },
        { _id: "no-plans", title: "Midweek", startDate: "2026-01-02" },
      ]),
    });

    const store = useServiceStore();
    await store.getServices();

    expect(store.state.services.map(service => service._id)).toEqual(["with-plans"]);
  });
});
