<script lang="ts" setup>
import { navigateTo } from "#imports";

const songStore = useSongStore();

onMounted(() => {
  if (songStore.state.songs.length === 0) {
    songStore.getSongs();
  };
});

const query = ref("");

const filteredSongs = computed(() => {
  if (!query.value) return songStore.state.songs;
  return songStore.state.songs.filter((song: Song) => song.title.toLowerCase().includes(query.value.toLowerCase()));
});

useSeoMeta({
  title: "Songs • Fluro Sheet Music Viewer",
});
</script>

<template>
  <page>
    <FloatLabel
      variant="in"
      style="margin-bottom: 2rem;"
    >
      <InputText
        id="in_label"
        v-model="query"
        variant="filled"
      />
      <label for="in_label">Search Songs</label>
    </FloatLabel>
    
    <div class="flex flex-col gap-4">
    <Card
      v-for="song in filteredSongs"
      :key="song._id"
      class="card"
    >
      <template #title>
        <Typography variant="h3" size="heading-md">
          {{ song.title }}
        </Typography>
        <Typography v-if="song.data.firstLine" variant="p" size="text">{{ song.data.firstLine }}</Typography>
      </template>
      <template #footer>
        <Button
          severity="secondary"
          @click.stop="navigateTo({ path: `/songs/${song._id}` })"
        >
          View Song
        </Button>
      </template>
    </Card>
    </div>
  </page>
</template>
