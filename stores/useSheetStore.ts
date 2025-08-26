import { useStorage } from "@vueuse/core";
import { clearPdfPageCache } from "~/utils/pdf";

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
    
    try {
      const { data } = await useAsyncFluroData("sheetMusic") as { data: Ref<Sheet[]> };
      // Handle case where data might be undefined or not a ref
      if (data && data.value) {
        state.sheets = data.value;
      } else {
        // Handle error case (user not logged in, etc.)
        console.warn("Failed to load sheets: no data returned");
        state.sheets = [];
      }
    } catch (error) {
      console.warn("Error loading sheets:", error);
      state.sheets = [];
    }
  }

  function getSheet(id: string) {
    return state.sheets.find((sheet: Sheet) => sheet._id === id);
  }

  watch(() => state.sheets, () => {
    persistedSheets.value = state.sheets;
    persistedSheetsExpiry.value = Date.now() + 24 * 60 * 60;
  });

  const clearCache = () => {
    persistedSheets.value = [];
    persistedSheetsExpiry.value = 0;
    clearPdfPageCache();
  };

  return { state, getSheets, getSheet, clearCache };
});
