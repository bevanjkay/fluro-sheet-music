import { computed, defineComponent, nextTick } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import GlobalDialog from "~/components/GlobalDialog.vue";

const songStoreMock = vi.hoisted(() => ({
  state: {
    populatedSongs: [] as PopulatedSong[],
  },
  clearCache: vi.fn(),
  getSongs: vi.fn(),
}));
const sheetStoreMock = vi.hoisted(() => ({
  clearCache: vi.fn(),
  getSheets: vi.fn(),
}));
const toastAddMock = vi.hoisted(() => vi.fn());
const clearExpiredCacheMock = vi.hoisted(() => vi.fn());
const getLocalStorageSizeMock = vi.hoisted(() => vi.fn(() => 2048));
const reloadNuxtAppMock = vi.hoisted(() => vi.fn());

mockNuxtImport("useSongStore", () => () => songStoreMock);
mockNuxtImport("useSheetStore", () => () => sheetStoreMock);
mockNuxtImport("useToast", () => () => ({ add: toastAddMock }));
mockNuxtImport("clearExpiredCache", () => clearExpiredCacheMock);
mockNuxtImport("getLocalStorageSize", () => getLocalStorageSizeMock);
mockNuxtImport("reloadNuxtApp", () => reloadNuxtAppMock);

const TypographyStub = {
  template: "<div><slot /></div>",
};

const ButtonStub = {
  props: ["label", "severity"],
  emits: ["click"],
  template: "<button type='button' @click=\"$emit('click', $event)\">{{ label }}<slot /></button>",
};

const SelectStub = defineComponent({
  props: {
    modelValue: {
      type: [String, Boolean, Number, Object, Array, null],
      default: "",
    },
    options: {
      type: Array,
      default: () => [],
    },
    optionLabel: {
      type: String,
      default: "",
    },
    optionValue: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const dataTest = computed(() => {
      const firstOption = props.options[0] as { name?: string } | undefined;
      if (props.placeholder) return "key-select";
      if (firstOption?.name === "Vertical") return "scroll-direction";
      if (firstOption?.name === "Light") return "dark-mode";
      return "select";
    });

    const onChange = (event: Event) => {
      const target = event.target as HTMLSelectElement;
      const rawValue = target.value;
      const selected = props.options.find((option) => {
        const record = option as Record<string, unknown>;
        const optionValue = props.optionValue ? record[props.optionValue] : option;
        return String(optionValue) === rawValue;
      });
      const record = selected as Record<string, unknown> | undefined;
      const value = props.optionValue && record ? record[props.optionValue] : selected ?? rawValue;
      emit("update:modelValue", value);
    };

    return { dataTest, onChange };
  },
  template: `
    <select :data-test="dataTest" :value="String(modelValue ?? '')" @change="onChange">
      <option
        v-for="option in options"
        :key="optionValue ? option[optionValue] : option"
        :value="String(optionValue ? option[optionValue] : option)"
      >
        {{ optionLabel ? option[optionLabel] : option }}
      </option>
    </select>
  `,
});

describe("GlobalDialog", () => {
  beforeEach(() => {
    localStorage.setItem("_fluro_user", JSON.stringify({ token: "test-token", refreshToken: "" }));
    localStorage.setItem("vertical", JSON.stringify(false));
    localStorage.setItem("darkMode", JSON.stringify(false));
    localStorage.setItem("keys", JSON.stringify({}));

    songStoreMock.state.populatedSongs = [
      {
        _id: "song-1",
        title: "Amazing Grace",
        data: {
          key: "C",
          firstLine: "Amazing grace how sweet the sound",
          sheetMusic: [],
        },
        sheetMusic: [
          { _id: "sheet-1", title: "C Major", data: { key: "C" } },
          { _id: "sheet-2", title: "G Major", data: { key: "G" } },
        ],
      },
    ];

    songStoreMock.clearCache.mockReset();
    songStoreMock.getSongs.mockReset();
    sheetStoreMock.clearCache.mockReset();
    sheetStoreMock.getSheets.mockReset();
    toastAddMock.mockReset();
    clearExpiredCacheMock.mockReset();
    getLocalStorageSizeMock.mockReset();
    getLocalStorageSizeMock.mockReturnValue(2048);
    reloadNuxtAppMock.mockReset();
  });

  it("persists display preferences and selected keys to storage", async () => {
    const wrapper = await mountSuspended(GlobalDialog, {
      global: {
        stubs: {
          Typography: TypographyStub,
          Select: SelectStub,
          SelectButton: SelectStub,
          Button: ButtonStub,
        },
      },
    });

    expect(wrapper.text()).toContain("Cached songs and sheets use 2 KB");

    await wrapper.get("[data-test='key-select']").setValue("sheet-2");
    await wrapper.get("[data-test='scroll-direction']").setValue("true");
    await wrapper.get("[data-test='dark-mode']").setValue("true");
    await nextTick();

    expect(JSON.parse(localStorage.getItem("keys") || "{}")).toEqual({ "song-1": "sheet-2" });
    expect(JSON.parse(localStorage.getItem("vertical") || "false")).toBe(true);
    expect(JSON.parse(localStorage.getItem("darkMode") || "false")).toBe(true);
  });

  it("clears and reloads cached content when requested", async () => {
    const wrapper = await mountSuspended(GlobalDialog, {
      global: {
        stubs: {
          Typography: TypographyStub,
          Select: SelectStub,
          SelectButton: SelectStub,
          Button: ButtonStub,
        },
      },
    });

    await wrapper.get("button").trigger("click");

    expect(songStoreMock.clearCache).toHaveBeenCalled();
    expect(songStoreMock.getSongs).toHaveBeenCalled();
    expect(sheetStoreMock.clearCache).toHaveBeenCalled();
    expect(sheetStoreMock.getSheets).toHaveBeenCalled();
    expect(clearExpiredCacheMock).toHaveBeenCalled();
    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({
      severity: "success",
      summary: "Cache Cleared",
    }));
    expect(reloadNuxtAppMock).toHaveBeenCalled();
  });
});
