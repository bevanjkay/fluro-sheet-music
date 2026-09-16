<script lang="ts" setup>
import { navigateTo, formatDate } from "#imports";

const serviceStore = useServiceStore();

// Tracks "the fetch finished" so an empty result reads as empty, not loading.
const loaded = ref(false);
onMounted(async () => {
  await serviceStore.getServices();
  loaded.value = true;
});

useSeoMeta({
  title: "Service Plans • Fluro Sheet Music Viewer",
});
</script>

<template>
  <page>
    <div class="mb-6 flex flex-col gap-2">
      <Typography variant="h1" size="heading-lg">Upcoming services</Typography>
      <p class="text-sm text-zinc-500 dark:text-zinc-400">
        Only services with an active plan appear here.
      </p>
    </div>

    <div v-if="serviceStore.state.services.length" class="grid items-start gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <Card v-for="service in serviceStore.state.services" :key="service._id">
        <template v-if="service.mainImage" #header>
          <div class="image-w-placeholder">
            <img :src="`https://api.fluro.io/get/${service.mainImage._id}`" :alt="service.title">
          </div>
        </template>
        <template #title>
          {{ service.title }}
        </template>
        <template #subtitle>
          {{ formatDate(service.startDate) }}
        </template>
        <template #footer>
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="plan in service.plans"
              :key="plan._id"
              :label="plan.title"
              severity="secondary"
              class="w-fit"
              @click="navigateTo(`/plans/${plan._id}`)"
            />
          </div>
        </template>
      </Card>
    </div>

    <div v-else-if="!loaded" class="flex flex-col items-center gap-4 py-20">
      <ProgressSpinner />
      <p class="text-sm text-zinc-500 dark:text-zinc-400">Loading services...</p>
    </div>

    <div v-else class="rounded-xl border border-dashed border-zinc-300 px-5 py-12 text-center dark:border-zinc-700">
      <Typography variant="h2" size="heading-sm">No upcoming services</Typography>
      <p class="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        Services appear here once they have an active plan in Fluro. In the meantime you can browse the song library or build a custom setlist.
      </p>
      <div class="mt-5 flex flex-wrap justify-center gap-2">
        <Button label="Browse songs" severity="secondary" to="/songs" />
        <Button label="Custom setlists" severity="secondary" to="/custom" />
      </div>
    </div>
  </page>
</template>
