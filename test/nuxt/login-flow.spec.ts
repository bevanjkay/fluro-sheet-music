import { nextTick } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import LoginPage from "~/pages/login.vue";

const loginMock = vi.hoisted(() => vi.fn());
const getUserSessionMock = vi.hoisted(() => vi.fn());
const navigateToMock = vi.hoisted(() => vi.fn());
const bootstrapMock = vi.hoisted(() => vi.fn(async () => {}));
const resetBootstrapMock = vi.hoisted(() => vi.fn());

const songStoreMock = vi.hoisted(() => ({
  clearCache: vi.fn(async () => {}),
  getSongs: vi.fn(async () => {}),
}));

const sheetStoreMock = vi.hoisted(() => ({
  clearCache: vi.fn(async () => {}),
  getSheets: vi.fn(async () => {}),
}));

vi.mock("~/utils/login", () => ({
  login: loginMock,
  getUserSession: getUserSessionMock,
}));

mockNuxtImport("useSongStore", () => () => songStoreMock);
mockNuxtImport("useSheetStore", () => () => sheetStoreMock);
mockNuxtImport("navigateTo", () => navigateToMock);
mockNuxtImport("useAppBootstrap", () => () => ({
  bootstrap: bootstrapMock,
  reset: resetBootstrapMock,
}));

const InputTextStub = {
  props: ["modelValue", "name", "type", "disabled"],
  emits: ["update:modelValue"],
  template: "<input :name='name' :type='type || \"text\"' :disabled='disabled' :value='modelValue' @input=\"$emit('update:modelValue', $event.target.value)\" />",
};

const PasswordStub = {
  props: ["modelValue", "name", "disabled"],
  emits: ["update:modelValue"],
  template: "<input :name='name' type='password' :disabled='disabled' :value='modelValue' @input=\"$emit('update:modelValue', $event.target.value)\" />",
};

const ButtonStub = {
  props: ["label", "disabled", "type"],
  template: "<button :disabled='disabled' :type='type || \"button\"'>{{ label }}<slot /></button>",
};

describe("login flow", () => {
  beforeEach(() => {
    localStorage.setItem("_fluro_user", JSON.stringify({ token: "", refreshToken: "" }));

    loginMock.mockReset();
    getUserSessionMock.mockReset();
    navigateToMock.mockReset();
    bootstrapMock.mockReset();
    resetBootstrapMock.mockReset();
    songStoreMock.clearCache.mockClear();
    sheetStoreMock.clearCache.mockClear();

    vi.stubGlobal("navigateTo", navigateToMock);
  });

  it("logs in successfully, starts app bootstrap, and redirects home", async () => {
    loginMock.mockResolvedValue({
      token: "token-123",
      refreshToken: "refresh-123",
    });
    getUserSessionMock.mockResolvedValue({ _id: "session-1" });

    const wrapper = await mountSuspended(LoginPage, {
      global: {
        stubs: {
          page: { template: "<div><slot /></div>" },
          Page: { template: "<div><slot /></div>" },
          Typography: { template: "<div><slot /></div>" },
          Card: { template: "<div><slot name='title' /><slot name='content' /><slot name='footer' /><slot /></div>" },
          FloatLabel: { template: "<label><slot /></label>" },
          InputText: InputTextStub,
          Password: PasswordStub,
          Message: { template: "<div><slot /></div>" },
          Button: ButtonStub,
          AbsoluteFooter: { template: "<div><slot /></div>" },
        },
      },
    });

    await wrapper.find("input[name='username']").setValue("bev");
    await wrapper.find("input[name='password']").setValue("secret");
    await wrapper.find("form").trigger("submit.prevent");
    await nextTick();
    await nextTick();
    await nextTick();

    expect(loginMock).toHaveBeenCalledWith("bev", "secret");
    expect(getUserSessionMock).toHaveBeenCalledWith({ token: "token-123", refreshToken: "refresh-123" });
    expect(songStoreMock.clearCache).toHaveBeenCalled();
    expect(sheetStoreMock.clearCache).toHaveBeenCalled();
    expect(resetBootstrapMock).toHaveBeenCalled();
    expect(bootstrapMock).toHaveBeenCalledWith({ force: true });
    expect(JSON.parse(localStorage.getItem("_fluro_user") || "{}")).toEqual({
      token: "token-123",
      refreshToken: "refresh-123",
    });
    expect(navigateToMock).toHaveBeenCalledWith({ path: "/", replace: true });
  });

  it("shows a login error and does not navigate when credentials fail", async () => {
    loginMock.mockResolvedValue({
      message: "Invalid username or password",
    });

    const wrapper = await mountSuspended(LoginPage, {
      global: {
        stubs: {
          page: { template: "<div><slot /></div>" },
          Page: { template: "<div><slot /></div>" },
          Typography: { template: "<div><slot /></div>" },
          Card: { template: "<div><slot name='title' /><slot name='content' /><slot name='footer' /><slot /></div>" },
          FloatLabel: { template: "<label><slot /></label>" },
          InputText: InputTextStub,
          Password: PasswordStub,
          Message: { template: "<div><slot /></div>" },
          Button: ButtonStub,
          AbsoluteFooter: { template: "<div><slot /></div>" },
        },
      },
    });

    await wrapper.find("input[name='username']").setValue("bev");
    await wrapper.find("input[name='password']").setValue("wrong");
    await wrapper.find("form").trigger("submit.prevent");
    await nextTick();
    await nextTick();

    expect(wrapper.text()).toContain("Invalid username or password");
    expect(navigateToMock).not.toHaveBeenCalledWith({ path: "/", replace: true });
    expect(bootstrapMock).not.toHaveBeenCalled();
  });
});
