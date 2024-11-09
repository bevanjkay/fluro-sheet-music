<script lang="ts" setup>
import { useFluroData } from '@/utils/fluro'

const route = useRoute();
const id = route.params.id;
const { data: song, status } = useFluroData("song", id);

const songStore = useSongStore();

watch(() => song.value, () => {
    songStore.setPlanSongs([song.value]);
})

</script>

<template>
    <div style="position: relative;" class="page">
        <div v-if="status !== 'success'"><h2>Loading song data...</h2><ProgressSpinner /></div>
        <PdfRenderer v-if="songStore.state.planSongs && songStore.state.planSongs.length" />
    </div>
</template>