export const useServiceStore = defineStore("serviceStore", () => {
  const state = reactive({
    services: [] as Service[],
    // Kept so the UI can tell "nothing scheduled" apart from "request failed"
    error: null as string | null,
  });

  async function getServices() {
    state.error = null;
    try {
      const { data } = await useAsyncFluroData("event", null, { sort: "startDate", status: "active", allDefinitions: true }) as { data?: Ref<Service[] | null> };
      const services = toRaw(data?.value) ?? [];
      state.services = services.filter((service: Service) => service.plans?.length);
    }
    catch (error) {
      state.error = error instanceof Error ? error.message : "Unable to load services";
      console.error(error);
    }
  }

  function getService(id: string) {
    return state.services.find((service: Service) => service._id === id);
  }

  return { state, getServices, getService };
});
