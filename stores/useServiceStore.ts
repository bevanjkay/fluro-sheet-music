
export const useServiceStore = defineStore('serviceStore', () => {
  const state = reactive({
    services: [],
  });

  async function getServices() {
    try {
      const { data } = await useAsyncFluroData('service', null, { sort: "startDate", status: "active", allDefinitions: true })
      state.services = data;
    } catch (error) {
      console.error(error);
    }
  }

  function getService(id) {
    return state.services.value.find(song => song._id === id)
  }

  return { state, getServices, getService }
})