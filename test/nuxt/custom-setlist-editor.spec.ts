import { nextTick } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import CustomSetlistsPage from "~/pages/custom/index.vue";

const useSongStoreMock = vi.hoisted(() => ({
  state: {
    songs: [] as Song[],
  },
}));
const navigateToMock = vi.hoisted(() => vi.fn());

mockNuxtImport("useSongStore", () => () => useSongStoreMock);
mockNuxtImport("navigateTo", () => navigateToMock);

const TypographyStub = {
  template: "<div><slot /></div>",
};

const PageStub = {
  template: "<div><slot /></div>",
};

const MessageStub = {
  template: "<div><slot /></div>",
};

const PanelStub = {
  props: ["header"],
  template: "<section><h2>{{ header }}</h2><slot /></section>",
};

const CardStub = {
  template: "<article><slot name='title' /><slot name='content' /><slot name='footer' /><slot /></article>",
};

const FloatLabelStub = {
  template: "<label><slot /></label>",
};

const InputTextStub = {
  props: ["modelValue", "name", "label"],
  emits: ["update:modelValue"],
  template: "<input :name='name || label' :value='modelValue' @input=\"$emit('update:modelValue', $event.target.value)\" />",
};

const ButtonStub = {
  props: ["label", "icon", "severity"],
  emits: ["click"],
  template: "<button type='button' @click=\"$emit('click', $event)\">{{ label || icon }}<slot /></button>",
};

const MultiSelectStub = {
  props: ["modelValue", "options"],
  emits: ["update:modelValue"],
  template: `
    <div>
      <button
        v-for="option in options"
        :key="option._id"
        type="button"
        :data-test="'pick-' + option._id"
        @click="$emit('update:modelValue', [...modelValue, option])"
      >
        {{ option.title }}
      </button>
    </div>
  `,
};

const DataTableStub = {
  template: "<div data-test='data-table'><slot /></div>",
};

const ColumnStub = {
  template: "<div><slot /></div>",
};

describe("custom setlist editor", () => {
  beforeEach(() => {
    localStorage.setItem("_fluro_user", JSON.stringify({ token: "test-token", refreshToken: "" }));
    localStorage.setItem("setlists", JSON.stringify([]));
    navigateToMock.mockReset();
    useSongStoreMock.state.songs = [
      {
        _id: "song-1",
        title: "Amazing Grace",
        data: {
          key: "C",
          firstLine: "Amazing grace how sweet the sound",
          sheetMusic: [],
        },
      },
    ];
  });

  const mountPage = () => mountSuspended(CustomSetlistsPage, {
    global: {
      stubs: {
        Page: PageStub,
        Typography: TypographyStub,
        Message: MessageStub,
        Button: ButtonStub,
        Panel: PanelStub,
        FloatLabel: FloatLabelStub,
        InputText: InputTextStub,
        MultiSelect: MultiSelectStub,
        DataTable: DataTableStub,
        Column: ColumnStub,
        Dropdown: { template: "<select />" },
        Card: CardStub,
      },
    },
  });

  it("creates and persists a new setlist", async () => {
    const wrapper = await mountPage();

    await wrapper.get("button").trigger("click");
    await wrapper.get("input[name='title']").setValue("Team Night");
    await wrapper.get("[data-test='pick-song-1']").trigger("click");
    await wrapper.findAll("button").find((button) => button.text().includes("Add Selected Songs"))!.trigger("click");
    await nextTick();
    await wrapper.findAll("button").find((button) => button.text() === "Create Setlist")!.trigger("click");
    await nextTick();

    const savedSetlists = JSON.parse(localStorage.getItem("setlists") || "[]");

    expect(savedSetlists).toHaveLength(1);
    expect(savedSetlists[0]).toEqual(expect.objectContaining({
      _id: "team-night",
      title: "Team Night",
    }));
    expect(savedSetlists[0].songs).toEqual([
      expect.objectContaining({
        _id: "song-1",
        title: "Amazing Grace",
        data: expect.objectContaining({ key: "C" }),
      }),
    ]);
  });

  it("requires a title and rejects duplicate setlist names", async () => {
    localStorage.setItem("setlists", JSON.stringify([
      {
        _id: "team-night",
        title: "Team Night",
        songs: [],
        created: "2026-03-23T00:00:00.000Z",
      },
    ]));

    const wrapper = await mountPage();

    await wrapper.get("button").trigger("click");
    await wrapper.get("[data-test='pick-song-1']").trigger("click");
    await wrapper.findAll("button").find((button) => button.text().includes("Add Selected Songs"))!.trigger("click");
    await nextTick();
    await wrapper.findAll("button").find((button) => button.text() === "Create Setlist")!.trigger("click");
    await nextTick();

    expect(wrapper.text()).toContain("Please enter a title for your setlist");

    await wrapper.get("input[name='title']").setValue("Team Night");
    await wrapper.findAll("button").find((button) => button.text() === "Create Setlist")!.trigger("click");
    await nextTick();

    expect(wrapper.text()).toContain("A setlist with that name already exists, please choose a different name");
    expect(JSON.parse(localStorage.getItem("setlists") || "[]")).toHaveLength(1);
  });

  it("deletes a saved setlist after confirmation", async () => {
    localStorage.setItem("setlists", JSON.stringify([
      {
        _id: "team-night",
        title: "Team Night",
        songs: [{ _id: "song-1", title: "Amazing Grace", key: "C", type: "song" }],
        created: "2026-03-23T00:00:00.000Z",
      },
    ]));

    const wrapper = await mountPage();

    const deleteButton = wrapper.findAll("button").find((button) => button.text() === "Delete");
    expect(deleteButton).toBeDefined();
    await deleteButton!.trigger("click");
    await nextTick();

    expect(wrapper.text()).toContain("Yes, I'm sure");

    await wrapper.findAll("button").find((button) => button.text() === "Yes, I'm sure")!.trigger("click");
    await nextTick();

    expect(JSON.parse(localStorage.getItem("setlists") || "[]")).toEqual([]);
  });
});
