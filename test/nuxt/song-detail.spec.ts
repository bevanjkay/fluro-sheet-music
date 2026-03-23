import { ref } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mountSuspended, mockComponent, mockNuxtImport } from "@nuxt/test-utils/runtime";
import SongDetailPage from "~/pages/songs/[id].vue";

const useRouteMock = vi.hoisted(() => vi.fn(() => ({ params: { id: "song-1" } })));
const useSongStoreMock = vi.hoisted(() => ({
  state: {
    planSongs: [] as PlanSong[],
  },
  setPlanSongs(songs: PlanSong[]) {
    this.state.planSongs = songs;
  },
}));
const useFluroDataMock = vi.hoisted(() => vi.fn());
const getUserSessionMock = vi.hoisted(() => vi.fn(async () => ({})));

vi.mock("~/utils/fluro", () => ({
  useFluroData: useFluroDataMock,
}));

vi.mock("~/utils/login", async () => ({
  getUserSession: getUserSessionMock,
  login: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("~/stores/useSongStore", () => ({
  useSongStore: () => useSongStoreMock,
}));

mockNuxtImport("useRoute", () => useRouteMock);
mockNuxtImport("useSongStore", () => () => useSongStoreMock);

mockComponent("PdfWrapper", {
  template: "<div data-test='pdf-wrapper'>PDF Wrapper</div>",
});

describe("song detail page", () => {
  beforeEach(() => {
    localStorage.setItem("_fluro_user", JSON.stringify({ token: "test-token", refreshToken: "" }));
    useSongStoreMock.state.planSongs = [];
    useRouteMock.mockReturnValue({ params: { id: "song-1" } });
    useFluroDataMock.mockReset();
    getUserSessionMock.mockClear();
  });

  it("seeds the viewer with a single fetched song", async () => {
    const song = {
      _id: "song-1",
      title: "Amazing Grace",
      type: "song",
      key: "G",
      data: {
        key: "G",
        firstLine: "Amazing grace how sweet the sound",
        sheetMusic: [],
      },
    };

    const songRef = ref<Song | null>(null);
    useFluroDataMock.mockReturnValue({
      data: songRef,
      status: ref("success"),
    });

    const wrapper = await mountSuspended(SongDetailPage, {
      global: {
        stubs: {
          page: { template: "<div><slot /></div>" },
          Page: { template: "<div><slot /></div>" },
          Typography: { template: "<div><slot /></div>" },
          ProgressSpinner: { template: "<div>spinner</div>" },
        },
      },
    });

    songRef.value = song;
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(useFluroDataMock).toHaveBeenCalledWith("song", "song-1");
    expect(useSongStoreMock.state.planSongs).toEqual([song]);
  });
});
