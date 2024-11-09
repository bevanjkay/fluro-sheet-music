
export const useSheetStore = defineStore('sheetStore', () => {
    const state = reactive({
      sheets: [],
    })

    async function getSheets() {
      const { data } = await useAsyncFluroData('sheetMusic')
      state.sheets = data
    }

    function getSheet() {
        return sheets.value.find(song => song._id === id)
    }
  
    return { state, getSheets, getSheet }
  })