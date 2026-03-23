import { ref } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mountSuspended, mockComponent, mockNuxtImport } from "@nuxt/test-utils/runtime";
import PlanDetailPage from "~/pages/plans/[id].vue";

const useRouteMock = vi.hoisted(() => vi.fn(() => ({ params: { id: "plan-1" } })));
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

describe("plan detail page", () => {
  beforeEach(() => {
    localStorage.setItem("_fluro_user", JSON.stringify({ token: "test-token", refreshToken: "" }));
    useSongStoreMock.state.planSongs = [];
    useRouteMock.mockReturnValue({ params: { id: "plan-1" } });
    useFluroDataMock.mockReset();
    getUserSessionMock.mockClear();
  });

  it("filters non-song schedules before seeding the viewer state", async () => {
    const plan: Plan = {
      _id: "plan-1",
      title: "Sunday Service",
      startDate: new Date("2026-03-23T00:00:00.000Z"),
      schedules: [
        { _id: "song-1", title: "Amazing Grace", type: "song", key: "G" },
        { _id: "speaker-1", title: "Welcome", type: "hosting", key: "" },
        { _id: "song-2", title: "Cornerstone", type: "song", key: "C" },
      ],
    };

    const planRef = ref<Plan | null>(null);
    useFluroDataMock.mockReturnValue({
      data: planRef,
      status: ref("success"),
    });

    const wrapper = await mountSuspended(PlanDetailPage, {
      global: {
        stubs: {
          page: { template: "<div><slot /></div>" },
          Page: { template: "<div><slot /></div>" },
          Typography: { template: "<div><slot /></div>" },
          ProgressSpinner: { template: "<div>spinner</div>" },
        },
      },
    });

    planRef.value = plan;
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(useFluroDataMock).toHaveBeenCalledWith("plan", "plan-1");
    expect(useSongStoreMock.state.planSongs).toEqual([
      { _id: "song-1", title: "Amazing Grace", type: "song", key: "G" },
      { _id: "song-2", title: "Cornerstone", type: "song", key: "C" },
    ]);
    expect(wrapper.find("[data-test='pdf-wrapper']").exists()).toBe(true);
  });
});
