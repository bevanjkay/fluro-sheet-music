<script lang="ts" setup>
import { useFluroData } from "@/utils/fluro";

const route = useRoute();
const id = route.params.id;

const { data: plan, status } = useFluroData("plan", id) as { data: Ref<Plan>, status: Ref<string> };

const songStore = useSongStore();

watch(() => plan.value, () => {

  const planSongs: PlanSong[] = plan.value.schedules.filter((schedule: Schedule) => schedule.type == "song");
  songStore.setPlanSongs(planSongs);
});

const title = computed(() => {
  if (plan.value) {
    return `${formatDate(plan.value.startDate)} • ${plan.value.title || "Service Plan"} • Fluro Sheet Music Viewer`;
  }
  return "Service Plan • Fluro Sheet Music Viewer";
});

useSeoMeta({
  title: () => title.value,
});
</script>

<template>
  <div>
    <div
      v-if="status !== 'success'"
      class="page"
    >
      <h2>Loading plan...</h2><ProgressSpinner />
    </div>
    <PdfWrapper />
  </div>
</template>
