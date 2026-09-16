import { nextTick } from "vue";
import { mountSuspended, mockComponent, mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PdfWrapper from "~/components/PdfWrapper.vue";

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

const useSheetStoreMock = vi.hoisted(() => ({
  state: {
    sheets: [] as Sheet[],
  },
}));

const getUserSessionMock = vi.hoisted(() => vi.fn(async () => ({})));

mockNuxtImport("useSongStore", () => () => useSongStoreMock);
mockNuxtImport("useSheetStore", () => () => useSheetStoreMock);
mockNuxtImport("getUserSession", () => getUserSessionMock);

mockComponent("PdfRender", {
  props: ["page", "sheetId", "song", "source"],
  emits: ["data"],
  mounted() {
    this.$emit("data", { id: this.song, numPages: 2, sheetId: this.sheetId });
  },
  template: "<div class='pdf-render'>{{ song }}::{{ page }}::{{ sheetId }}</div>",
});

const buildSheet = (id: string, key?: string): Sheet => ({
  _id: id,
  title: `Sheet ${id}`,
  data: key ? { key } : {},
});

const buildSong = (): Song => ({
  _id: "song-1",
  title: "Amazing Grace",
  data: {
    key: "C",
    firstLine: "Amazing grace how sweet the sound",
    sheetMusic: [{ _id: "sheet-c", title: "Sheet C" }, { _id: "sheet-g", title: "Sheet G" }],
  },
});

describe("PdfWrapper", () => {
  beforeEach(() => {
    localStorage.setItem("_fluro_user", JSON.stringify({ token: "test-token", refreshToken: "" }));
    useSongStoreMock.state.songs = [];
    useSongStoreMock.state.planSongs = [];
    useSongStoreMock.state.populatedSongs = [];
    useSheetStoreMock.state.sheets = [];
  });

  it("hydrates plan songs and prefers the saved key selection", async () => {
    localStorage.setItem("keys", JSON.stringify({ "song-1": "sheet-g" }));

    useSongStoreMock.state.songs = [buildSong()];
    useSongStoreMock.state.planSongs = [{ _id: "song-1", title: "Amazing Grace", type: "song", key: "C" }];
    useSheetStoreMock.state.sheets = [buildSheet("sheet-c", "C"), buildSheet("sheet-g", "G")];

    const wrapper = await mountSuspended(PdfWrapper, {
      global: {
        stubs: {
          Button: { props: ["label"], template: "<button>{{ label }}<slot /></button>" },
        },
      },
    });

    await nextTick();
    await nextTick();

    expect(useSongStoreMock.state.populatedSongs).toHaveLength(1);
    expect(useSongStoreMock.state.populatedSongs[0]?.selectedSheet?._id).toBe("sheet-g");
    expect(wrapper.findAll(".pdf-render")).toHaveLength(2);
  });

  it("shows the empty-state actions when no songs are available", async () => {
    useSongStoreMock.state.songs = [];
    useSongStoreMock.state.planSongs = [];
    useSheetStoreMock.state.sheets = [];

    const wrapper = await mountSuspended(PdfWrapper, {
      global: {
        stubs: {
          Button: { props: ["label"], template: "<button>{{ label }}<slot /></button>" },
        },
      },
    });

    expect(wrapper.text()).toContain("No songs in this plan");
    expect(wrapper.text()).toContain("Service plans");
  });
});
