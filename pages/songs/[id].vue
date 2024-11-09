<script lang="ts" setup>
import { useStorage } from "@vueuse/core";
import { useFluroData } from '@/utils/fluro'

const route = useRoute();
const id = route.params.id;
const { data: song, status } = useFluroData("song", id);

const songStore = useSongStore();
songStore.setPlanSongs([song.value]);
</script>

<template>
    <div style="position: relative;">
        <h3 v-if="status == 'pending'">Fetching Data</h3>
        <div v-else>
            <PdfRenderer />
        </div>
    </div>
</template>