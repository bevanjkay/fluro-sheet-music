import { useStorage } from "@vueuse/core";

export const useSheetStore = defineStore("sheetStore", () => {
  const state = reactive({
    sheets: [] as Sheet[],
  });

  const persistedSheets: Ref<Sheet[]> = useStorage("persistedSheets", state.sheets);
  const persistedSheetsExpiry: Ref<number> = useStorage("persistedSheetsExpiry", 0);

  async function getSheets() {
    if (persistedSheetsExpiry.value > Date.now()) {
      if (state.sheets.length > 0) {
        state.sheets = persistedSheets.value;
        return;
      }
    }
    const { data } = await useAsyncFluroData("sheetMusic") as { data: Ref<Sheet[]> };
    state.sheets = data.value;
  }

  function getSheet(id: string) {
    return state.sheets.find((sheet: Sheet) => sheet._id === id);
  }

  watch(() => state.sheets, () => {
    // Only persist sheets if the list is not too large
    if (state.sheets.length < 2000) {
      persistedSheets.value = state.sheets;
      persistedSheetsExpiry.value = Date.now() + 24 * 60 * 60 * 1000;
    } else {
      console.warn("Sheet list too large to cache, skipping localStorage");
    }
  });

  const clearCache = () => {
    persistedSheets.value = [];
    persistedSheetsExpiry.value = 0;
  };

  return { state, getSheets, getSheet, clearCache };
});
