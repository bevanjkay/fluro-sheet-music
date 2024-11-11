<script lang="ts" setup>
import { useFluroData } from "@/utils/fluro";

const route = useRoute();
const id = route.params.id;
const { data: song, status } = useFluroData("song", id) as { data: Ref<Song | null>, status: Ref<string> };

const songStore = useSongStore();

watch(() => song.value, () => {
  songStore.setPlanSongs([song.value as unknown as PlanSong]);
});

useSeoMeta({
  title: () => `${song.value?.title || "Song"} • Fluro Sheet Music Viewer`,
});
</script>

<template>
  <div style="position: relative;">
    <div
      v-if="status !== 'success'"
      class="page"
    >
      <h2>Loading song data...</h2><ProgressSpinner />
    </div>
    <PdfWrapper v-if="songStore.state.planSongs && songStore.state.planSongs.length" />
  </div>
</template>
