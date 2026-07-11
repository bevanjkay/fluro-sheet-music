<script lang="ts" setup>
import { useFluroData } from "@/utils/fluro";

const route = useRoute();
const id = route.params.id;
const { data: song, status } = useFluroData("song", id) as { data: Ref<Song | null>, status: Ref<string> };

const songStore = useSongStore();

watch(() => song.value, () => {
  if (!song.value) {
    return;
  }
  songStore.setPlanSongs([song.value as unknown as PlanSong]);
});

useSeoMeta({
  title: () => `${song.value?.title || "Song"} • Fluro Sheet Music Viewer`,
});
</script>

<template>
  <div style="position: relative;">
    <page v-if="status !== 'success'">
      <Typography variant="h3" size="heading-md">Loading plan...</Typography>
      <ProgressSpinner />
    </page>
    <PdfWrapper v-if="songStore.state.planSongs && songStore.state.planSongs.length" />
  </div>
</template>
