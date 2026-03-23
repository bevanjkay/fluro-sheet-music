import { ref } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { useSongStore } from "~/stores/useSongStore";

const useAsyncFluroDataMock = vi.hoisted(() => vi.fn());

mockNuxtImport("useAsyncFluroData", () => useAsyncFluroDataMock);

const buildSong = (id: string, title: string): Song => ({
  _id: id,
  title,
  data: {
    key: "C",
    firstLine: `${title} first line`,
    sheetMusic: [],
  },
});

describe("useSongStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useAsyncFluroDataMock.mockReset();
  });

  it("uses cached songs when the cache is still valid", async () => {
    const cachedSongs = [buildSong("song-1", "Cached Song")];
    localStorage.setItem("persistedSongs", JSON.stringify(cachedSongs));
    localStorage.setItem("persistedSongsExpiry", JSON.stringify(Date.now() + 60_000));

    const store = useSongStore();
    await store.getSongs();

    expect(store.state.songs).toEqual(cachedSongs);
    expect(useAsyncFluroDataMock).not.toHaveBeenCalled();
  });

  it("fetches and persists songs when the cache is expired", async () => {
    const fetchedSongs = [buildSong("song-2", "Fetched Song")];
    localStorage.setItem("persistedSongs", JSON.stringify([buildSong("song-old", "Old Song")]));
    localStorage.setItem("persistedSongsExpiry", JSON.stringify(Date.now() - 60_000));
    useAsyncFluroDataMock.mockResolvedValue({
      data: ref(fetchedSongs),
    });

    const store = useSongStore();
    await store.getSongs();

    expect(useAsyncFluroDataMock).toHaveBeenCalledWith("song", null, { sort: "title" });
    expect(store.state.songs).toEqual(fetchedSongs);
    expect(JSON.parse(localStorage.getItem("persistedSongs") || "[]")).toEqual(fetchedSongs);
    expect(Number(localStorage.getItem("persistedSongsExpiry"))).toBeGreaterThan(Date.now());
  });
});
