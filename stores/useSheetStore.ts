export const useSheetStore = defineStore('sheetStore', () => {
  const state = reactive({
    sheets: [] as Sheet[],
  })

  async function getSheets() {
    const { data } = await useAsyncFluroData('sheetMusic') as { data: Ref<Sheet[]> }
    state.sheets = data.value
  }

  function getSheet(id: string) {
    return state.sheets.find((sheet: Sheet) => sheet._id === id)
  }

  return { state, getSheets, getSheet }
})
