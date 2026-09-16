export const useServiceStore = defineStore("serviceStore", () => {
  const state = reactive({
    services: [] as Service[],
  });

  async function getServices() {
    try {
      const { data } = await useAsyncFluroData("event", null, { sort: "startDate", status: "active", allDefinitions: true }) as { data?: Ref<Service[] | null> };
      const services = toRaw(data?.value) ?? [];
      state.services = services.filter((service: Service) => service.plans?.length);
    }
    catch (error) {
      console.error(error);
    }
  }

  function getService(id: string) {
    return state.services.find((service: Service) => service._id === id);
  }

  return { state, getServices, getService };
});
