<script lang="ts" setup>
import { useFluroData } from "@/utils/fluro";

const route = useRoute();
const id = route.params.id;
const { data: song, status } = useFluroData("song", id) as { data: Ref<Song | null>, status: Ref<string> };

const songStore = useSongStore();

watch(() => song.value, () => {
  if (!song.value) {
    songStore.setPlanSongs([]);
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
      <div class="flex flex-col items-center gap-4 py-20">
        <ProgressSpinner />
        <p class="text-sm text-zinc-500 dark:text-zinc-400">Loading song...</p>
      </div>
    </page>
    <PdfWrapper v-if="songStore.state.planSongs && songStore.state.planSongs.length" />
  </div>
</template>
