<script lang="ts" setup>
import { useFluroData } from "@/utils/fluro";

const route = useRoute();
const id = route.params.id;
const { data: song, status } = useFluroData("song", id);

const songStore = useSongStore();

watch(() => song.value, () => {
  songStore.setPlanSongs([song.value as PlanSong]);
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
