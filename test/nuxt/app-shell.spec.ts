import { nextTick } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import App from "~/app.vue";

const songStoreMock = vi.hoisted(() => ({
  getSongs: vi.fn(async () => {}),
}));
const sheetStoreMock = vi.hoisted(() => ({
  getSheets: vi.fn(async () => {}),
}));
const clearExpiredCacheMock = vi.hoisted(() => vi.fn());
const checkLocalStorageCapacityMock = vi.hoisted(() => vi.fn(() => false));
const dialogOpenMock = vi.hoisted(() => vi.fn());
const confirmRequireMock = vi.hoisted(() => vi.fn());
const toastAddMock = vi.hoisted(() => vi.fn());
const navigateToMock = vi.hoisted(() => vi.fn());

mockNuxtImport("useSongStore", () => () => songStoreMock);
mockNuxtImport("useSheetStore", () => () => sheetStoreMock);
mockNuxtImport("clearExpiredCache", () => clearExpiredCacheMock);
mockNuxtImport("checkLocalStorageCapacity", () => checkLocalStorageCapacityMock);
mockNuxtImport("useDialog", () => () => ({ open: dialogOpenMock }));
mockNuxtImport("useConfirm", () => () => ({ require: confirmRequireMock }));
mockNuxtImport("useToast", () => () => ({ add: toastAddMock }));
mockNuxtImport("navigateTo", () => navigateToMock);

const ButtonStub = {
  props: ["label", "icon", "severity", "variant"],
  emits: ["click"],
  template: "<button type='button' @click=\"$emit('click', $event)\">{{ label || icon }}<slot /></button>",
};

describe("app shell", () => {
  beforeEach(() => {
    localStorage.setItem("_fluro_user", JSON.stringify({ token: "token-123", refreshToken: "refresh-123" }));
    localStorage.setItem("darkMode", JSON.stringify(false));
    document.documentElement.className = "";

    songStoreMock.getSongs.mockClear();
    sheetStoreMock.getSheets.mockClear();
    clearExpiredCacheMock.mockClear();
    checkLocalStorageCapacityMock.mockReset();
    checkLocalStorageCapacityMock.mockReturnValue(false);
    dialogOpenMock.mockClear();
    confirmRequireMock.mockClear();
    toastAddMock.mockClear();
    navigateToMock.mockClear();
  });

  it("warms app data on mount, warns about storage pressure, and applies dark mode", async () => {
    checkLocalStorageCapacityMock.mockReturnValue(true);
    localStorage.setItem("darkMode", JSON.stringify(true));

    const wrapper = await mountSuspended(App, {
      global: {
        stubs: {
          DynamicDialog: { template: "<div />" },
          ConfirmDialog: { template: "<div />" },
          Toast: { template: "<div />" },
          Menubar: { template: "<div data-test='menubar'><slot name='end' /></div>" },
          Button: ButtonStub,
          page: { template: "<div><slot /></div>" },
          Page: { template: "<div><slot /></div>" },
          Typography: { template: "<div><slot /></div>" },
          ProgressSpinner: { template: "<div>spinner</div>" },
          NuxtPage: { template: "<div data-test='nuxt-page'>Nuxt Page</div>" },
        },
      },
    });

    await nextTick();
    await nextTick();

    expect(clearExpiredCacheMock).toHaveBeenCalled();
    expect(checkLocalStorageCapacityMock).toHaveBeenCalled();
    expect(songStoreMock.getSongs).toHaveBeenCalled();
    expect(sheetStoreMock.getSheets).toHaveBeenCalled();
    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({
      severity: "warn",
      summary: "Storage Warning",
    }));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(wrapper.find("[data-test='nuxt-page']").exists()).toBe(true);

    const settingsButton = wrapper.findAll("button").find((button) => button.text() === "Settings");
    expect(settingsButton).toBeDefined();
    await settingsButton!.trigger("click");
    expect(dialogOpenMock).toHaveBeenCalled();
  });

  it("logs out through the confirm accept handler", async () => {
    const wrapper = await mountSuspended(App, {
      global: {
        stubs: {
          DynamicDialog: { template: "<div />" },
          ConfirmDialog: { template: "<div />" },
          Toast: { template: "<div />" },
          Menubar: { template: "<div data-test='menubar'><slot name='end' /></div>" },
          Button: ButtonStub,
          page: { template: "<div><slot /></div>" },
          Page: { template: "<div><slot /></div>" },
          Typography: { template: "<div><slot /></div>" },
          ProgressSpinner: { template: "<div>spinner</div>" },
          NuxtPage: { template: "<div data-test='nuxt-page'>Nuxt Page</div>" },
        },
      },
    });

    const logoutButton = wrapper.findAll("button").find((button) => button.text() === "Logout");
    expect(logoutButton).toBeDefined();
    await logoutButton!.trigger("click");

    expect(confirmRequireMock).toHaveBeenCalledWith(expect.objectContaining({
      header: "Logout",
    }));

    const confirmConfig = confirmRequireMock.mock.calls[0]?.[0] as { accept: () => void } | undefined;
    expect(confirmConfig).toBeDefined();
    confirmConfig!.accept();
    await nextTick();

    expect(JSON.parse(localStorage.getItem("_fluro_user") || "{}")).toEqual({
      token: "",
      refreshToken: "",
    });
    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({
      severity: "success",
      summary: "Logged out",
    }));
    expect(navigateToMock).toHaveBeenCalledWith("/login");
  });
});
