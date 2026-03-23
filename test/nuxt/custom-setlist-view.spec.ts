import { beforeEach, describe, expect, it, vi } from "vitest";
import { mountSuspended, mockComponent, mockNuxtImport } from "@nuxt/test-utils/runtime";
import CustomSetlistPage from "~/pages/custom/[id].vue";

const useRouteMock = vi.hoisted(() => vi.fn(() => ({ params: { id: "team-night" } })));
const useSongStoreMock = vi.hoisted(() => ({
  state: {
    songs: [] as Song[],
    planSongs: [] as PlanSong[],
    populatedSongs: [] as PopulatedSong[],
  },
  setPlanSongs(songs: PlanSong[]) {
    this.state.planSongs = songs;
  },
  setPopulatedSongs(songs: PopulatedSong[]) {
    this.state.populatedSongs = songs;
  },
}));
const getUserSessionMock = vi.hoisted(() => vi.fn(async () => ({})));

mockNuxtImport("useRoute", () => useRouteMock);
mockNuxtImport("useSongStore", () => () => useSongStoreMock);
mockNuxtImport("getUserSession", () => getUserSessionMock);

mockComponent("PdfWrapper", {
  template: "<div data-test='pdf-wrapper'>PDF Wrapper</div>",
});

describe("custom setlist view", () => {
  beforeEach(() => {
    localStorage.setItem("_fluro_user", JSON.stringify({ token: "test-token", refreshToken: "" }));
    useRouteMock.mockReturnValue({ params: { id: "team-night" } });
    useSongStoreMock.state.planSongs = [];
    useSongStoreMock.state.songs = [];
    useSongStoreMock.state.populatedSongs = [];
  });

  it("loads the selected setlist from storage into the song store", async () => {
    const setlistSongs = [
      { _id: "song-1", title: "Amazing Grace", key: "G", type: "song" },
      { _id: "song-2", title: "Cornerstone", key: "C", type: "song" },
    ];

    localStorage.setItem("setlists", JSON.stringify([
      {
        _id: "team-night",
        title: "Team Night",
        songs: setlistSongs,
        created: "2026-03-23T00:00:00.000Z",
      },
    ]));

    const wrapper = await mountSuspended(CustomSetlistPage);

    expect(useSongStoreMock.state.planSongs).toEqual(setlistSongs);
    expect(wrapper.find("[data-test='pdf-wrapper']").exists()).toBe(true);
  });
});
