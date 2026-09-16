<script lang="ts" setup>
import { useFluroData } from "@/utils/fluro";

const route = useRoute();
const id = route.params.id;

const { data: plan, status } = useFluroData("plan", id) as { data: Ref<Plan>, status: Ref<string> };

const songStore = useSongStore();

watch(() => plan.value, () => {
  if (!plan.value?.schedules) {
    songStore.setPlanSongs([]);
    return;
  }
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
    <page v-if="status !== 'success'">
      <div class="flex flex-col items-center gap-4 py-20">
        <ProgressSpinner />
        <p class="text-sm text-zinc-500 dark:text-zinc-400">Loading plan...</p>
      </div>
    </page>
    <PdfWrapper />
  </div>
</template>
