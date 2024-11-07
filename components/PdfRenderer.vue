<script lang="ts" setup>
const props = defineProps({
    songs: Object,
    vertical: Boolean
})

const createURL = (sheet) => {
    return `https://api.fluro.io/get/${sheet._id}`
}

const initialized = ref(false);

const handleData = (data) => {
    const { id, numPages } = data;
    const matchedSong = populatedSongs.value.find((song) => song._id == id);
    matchedSong.pages = [];
    for (let i = 1; i <= numPages; i++) {
        matchedSong.pages.push(i);
    }
}

const populateSongs = () => {
    populatedSongs.value = props.songs.map(song => {
        song.pages = ["1"];
        return song;
    })
}

watch(() => props.songs, (newSongs, oldSongs) => {
    console.log("Change detected", newSongs, oldSongs);
    if (newSongs.length && !initialized.value) {
        populateSongs();
        initialized.value = true;
    }
});

const populatedSongs = ref([]);

</script>

<template>
    <div class="pdf">
        <Swiper autoHeight="true" :direction="vertical ? 'vertical' : 'horizontal'">
            <template v-for="song in populatedSongs">
                <SwiperSlide v-for="page in song.pages" :key="song._id + page">
                    <Pdf :page="page" :source="createURL(song.selectedSheet)" :song="song._id" @data="handleData" />
                </SwiperSlide>
            </template>
        </Swiper>
    </div>
</template>

<style scoped>
</style>