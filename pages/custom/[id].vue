<script lang="ts" setup>
import { useStorage } from "@vueuse/core";

const route = useRoute();
const id = route.params.id;

const setlists: Ref<CustomSetlist[]> = useStorage("setlists", []);
const setlist: ComputedRef<CustomSetlist | undefined> = computed(() => setlists.value.find((s: CustomSetlist) => s._id == id));

const songStore = useSongStore();
watch(() => setlist.value, () => {
  if (setlist.value) {
    songStore.setPlanSongs(setlist.value.songs);
  }
});
</script>

<template>
  <div style="position: relative;">
    <PdfWrapper v-if="songStore.state.planSongs && songStore.state.planSongs.length" />
  </div>
</template>
