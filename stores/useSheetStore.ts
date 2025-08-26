import { useStorage } from "@vueuse/core";
import { prefetchPdfPageCounts, clearPdfPageCache } from "~/utils/pdf";

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
        // Still prefetch page counts for cached sheets if needed
        prefetchPageCounts();
        return;
      }
    }
    
    try {
      const { data } = await useAsyncFluroData("sheetMusic") as { data: Ref<Sheet[]> };
      // Handle case where data might be undefined or not a ref
      if (data && data.value) {
        state.sheets = data.value;
        // Prefetch page counts for newly loaded sheets
        prefetchPageCounts();
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

  function prefetchPageCounts() {
    if (state.sheets && Array.isArray(state.sheets) && state.sheets.length > 0) {
      // Get user token for authenticated requests
      const user = useStorage("_fluro_user", { token: "", refreshToken: "" });
      
      // Only proceed if user has a token
      if (!user.value.token) {
        return;
      }
      
      const sheetsWithUrls = state.sheets.map(sheet => ({
        _id: sheet._id,
        url: `https://api.fluro.io/get/${sheet._id}?access_token=${user.value.token}`
      }));
      
      // Prefetch in background without blocking
      prefetchPdfPageCounts(sheetsWithUrls).catch(error => {
        console.warn("Error prefetching PDF page counts:", error);
      });
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
