import { afterEach, beforeEach, vi } from "vitest";

class MemoryStorage implements Storage {
  #keys = new Set<string>();

  get length() {
    return this.#keys.size;
  }

  clear() {
    for (const key of this.#keys) {
      Reflect.deleteProperty(this, key);
    }
    this.#keys.clear();
  }

  getItem(key: string) {
    const value = this[key as keyof this];
    return typeof value === "string" ? value : null;
  }

  key(index: number) {
    return [...this.#keys][index] ?? null;
  }

  removeItem(key: string) {
    Reflect.deleteProperty(this, key);
    this.#keys.delete(key);
  }

  setItem(key: string, value: string) {
    Object.defineProperty(this, key, {
      value,
      writable: true,
      configurable: true,
      enumerable: true,
    });
    this.#keys.add(key);
  }
}

const localStorageMock = new MemoryStorage();
const sessionStorageMock = new MemoryStorage();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis, "sessionStorage", {
  value: sessionStorageMock,
  writable: true,
  configurable: true,
});

beforeEach(() => {
  localStorageMock.clear();
  sessionStorageMock.clear();

  vi.stubGlobal("localStorage", localStorageMock);
  vi.stubGlobal("sessionStorage", sessionStorageMock);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    json: async () => ({}),
  }));
  vi.stubGlobal("navigateTo", vi.fn((path: string) => path));
  vi.stubGlobal("reloadNuxtApp", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});
