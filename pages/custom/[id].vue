<script lang="ts" setup>
import { useStorage } from "@vueuse/core";

const route = useRoute();
const id = route.params.id;

const setlists = useStorage("setlists", []);
const setlist = computed(() => setlists.value.find(s => s._id == id));

const songStore = useSongStore();
songStore.setPlanSongs(setlist.value.songs);
</script>

<template>
    <div style="position: relative;">
        <!-- <pre>{{  songStore.state.planSongs  }}</pre> -->
        <PdfRenderer v-if="songStore.state.planSongs && songStore.state.planSongs.length" />
    </div>
</template>