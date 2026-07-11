// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const storageState = vi.hoisted(() => new Map<string, { value: User }>());
const navigateToMock = vi.hoisted(() => vi.fn((path: string) => path));
const fetchMock = vi.hoisted(() => vi.fn());
const getUserSessionMock = vi.hoisted(() =>
  vi.fn(async (user: User) => {
    const response = await fetch("https://api.fluro.io/session", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user.token}`,
      },
    });

    return response.json();
  }),
);

const mockNuxtExports = {
  defineNuxtRouteMiddleware: (handler: unknown) => handler,
  getUserSession: getUserSessionMock,
  navigateTo: navigateToMock,
};

vi.mock("nuxt/app", () => mockNuxtExports);
vi.mock("#app", () => mockNuxtExports);
vi.mock("#imports", () => mockNuxtExports);
vi.mock("#app/composables/router", () => mockNuxtExports);

vi.mock("@vueuse/core", async () => {
  const actual = await vi.importActual<typeof import("@vueuse/core")>("@vueuse/core");

  return {
    ...actual,
    useStorage: (key: string, defaultValue: User) => {
      if (!storageState.has(key)) {
        storageState.set(key, {
          value: JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultValue)),
        });
      }

      return storageState.get(key)!;
    },
  };
});

describe("auth middleware", () => {
  beforeEach(() => {
    vi.resetModules();
    storageState.clear();
    localStorage.setItem("_fluro_user", JSON.stringify({ token: "", refreshToken: "" }));
    navigateToMock.mockClear();
    fetchMock.mockReset();
    getUserSessionMock.mockClear();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("skips session checks for the ipad simulator route", async () => {
    const middleware = (await import("~/middleware/auth.global")).default;
    const result = await middleware({ path: "/ipad-sim" } as never, { path: "/" } as never);

    expect(result).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refreshes the token after a session check failure and allows navigation", async () => {
    localStorage.setItem("_fluro_user", JSON.stringify({ token: "expired-token", refreshToken: "refresh-123" }));
    fetchMock
      .mockRejectedValueOnce(new Error("expired"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: "fresh-token" }),
      });

    const middleware = (await import("~/middleware/auth.global")).default;
    const result = await middleware({ path: "/songs" } as never, { path: "/" } as never);

    expect(result).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith("https://api.fluro.io/token/refresh", expect.any(Object));
    expect(storageState.get("_fluro_user")?.value.token).toBe("fresh-token");
    expect(navigateToMock).not.toHaveBeenCalledWith("/login");
  });

  it("clears credentials and redirects to login when the token refresh is rejected", async () => {
    localStorage.setItem("_fluro_user", JSON.stringify({ token: "expired-token", refreshToken: "refresh-123" }));
    fetchMock
      .mockRejectedValueOnce(new Error("expired"))
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: "invalid refresh token" }),
      });

    const middleware = (await import("~/middleware/auth.global")).default;
    const result = await middleware({ path: "/songs" } as never, { path: "/" } as never);

    expect(result).toBe("/login");
    expect(storageState.get("_fluro_user")?.value.token).toBe("");
    expect(storageState.get("_fluro_user")?.value.refreshToken).toBe("");
  });
});
