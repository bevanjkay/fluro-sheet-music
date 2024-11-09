<script lang="ts" setup>
const songStore = useSongStore();
songStore.getSongs();

const query = ref("");

const filteredSongs = computed(() => {
    if (!query.value) return songStore.state.songs;
    return songStore.state.songs.filter((song) => song.title.toLowerCase().includes(query.value.toLowerCase()));
})
</script>

<template>
    <div>
            <FloatLabel variant="in" style="margin-bottom: 2rem;">
                <InputText id="in_label" v-model="query" variant="filled" />
                <label for="in_label">Search Songs</label>
            </FloatLabel>
            <Card v-for="song in filteredSongs" :key="song._id" style="max-width:25em; margin-bottom: 2rem;">
                <template #title>
                    <h3 style="margin-bottom: 0; margin-top: 0;">{{ song.title }}</h3>
                </template>
                <template #footer>
                    <Button severity="secondary" @click="navigateTo(`/songs/${song._id}`)">View Song</Button>
                </template>
            </Card>
    </div>
</template>