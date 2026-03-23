import { computed, defineComponent } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import { useAppBootstrap } from "~/composables/useAppBootstrap";

const isAuthenticatedMock = vi.hoisted(() => vi.fn(() => true));
const getUserSessionMock = vi.hoisted(() => vi.fn(async () => ({})));
const navigateToMock = vi.hoisted(() => vi.fn());
const songStoreMock = vi.hoisted(() => ({
  getSongs: vi.fn(async () => {}),
}));
const sheetStoreMock = vi.hoisted(() => ({
  getSheets: vi.fn(async () => {}),
}));

mockNuxtImport("useSongStore", () => () => songStoreMock);
mockNuxtImport("useSheetStore", () => () => sheetStoreMock);
mockNuxtImport("isAuthenticated", () => isAuthenticatedMock);
mockNuxtImport("getUserSession", () => getUserSessionMock);
mockNuxtImport("navigateTo", () => navigateToMock);

const BootstrapHarness = defineComponent({
  setup() {
    const bootstrapState = useAppBootstrap();

    return {
      ...bootstrapState,
      pendingValue: computed(() => bootstrapState.pending.value),
      statusValue: computed(() => bootstrapState.status.value),
    };
  },
  template: "<div />",
});

describe("useAppBootstrap", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    isAuthenticatedMock.mockReset();
    isAuthenticatedMock.mockReturnValue(true);
    getUserSessionMock.mockReset();
    navigateToMock.mockReset();
    songStoreMock.getSongs.mockReset();
    sheetStoreMock.getSheets.mockReset();
  });

  it("deduplicates concurrent bootstrap requests", async () => {
    let resolveSongs!: () => void;
    let resolveSheets!: () => void;

    songStoreMock.getSongs.mockImplementation(() => new Promise<void>((resolve) => {
      resolveSongs = resolve;
    }));
    sheetStoreMock.getSheets.mockImplementation(() => new Promise<void>((resolve) => {
      resolveSheets = resolve;
    }));

    const wrapper = await mountSuspended(BootstrapHarness);

    const first = wrapper.vm.bootstrap();
    const second = wrapper.vm.bootstrap();

    expect(wrapper.vm.pendingValue).toBe(true);
    expect(songStoreMock.getSongs).toHaveBeenCalledTimes(1);
    expect(sheetStoreMock.getSheets).toHaveBeenCalledTimes(1);

    resolveSongs();
    resolveSheets();
    await Promise.all([first, second]);

    expect(wrapper.vm.statusValue).toBe("ready");
    expect(wrapper.vm.pendingValue).toBe(false);
  });

  it("resets to idle when the user is not authenticated", async () => {
    isAuthenticatedMock.mockReturnValue(false);

    const wrapper = await mountSuspended(BootstrapHarness);
    await wrapper.vm.bootstrap();

    expect(wrapper.vm.statusValue).toBe("idle");
    expect(songStoreMock.getSongs).not.toHaveBeenCalled();
    expect(sheetStoreMock.getSheets).not.toHaveBeenCalled();
  });

  it("does not restore ready state after reset when an earlier bootstrap resolves", async () => {
    let resolveSongs!: () => void;
    let resolveSheets!: () => void;

    songStoreMock.getSongs.mockImplementation(() => new Promise<void>((resolve) => {
      resolveSongs = resolve;
    }));
    sheetStoreMock.getSheets.mockImplementation(() => new Promise<void>((resolve) => {
      resolveSheets = resolve;
    }));

    const wrapper = await mountSuspended(BootstrapHarness);
    const request = wrapper.vm.bootstrap();

    expect(wrapper.vm.statusValue).toBe("pending");

    wrapper.vm.reset();

    expect(wrapper.vm.statusValue).toBe("idle");
    expect(wrapper.vm.pendingValue).toBe(false);

    resolveSongs();
    resolveSheets();
    await request;

    expect(wrapper.vm.statusValue).toBe("idle");
    expect(wrapper.vm.pendingValue).toBe(false);
  });
});
