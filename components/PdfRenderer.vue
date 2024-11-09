<script lang="ts" setup>
import { useStorage } from "@vueuse/core";

const sheetStore = useSheetStore();
sheetStore.getSheets();

const songStore = useSongStore();
songStore.getSongs();

const createURL = (sheet) => {
    return `https://api.fluro.io/get/${sheet._id}`
}

const populatedSongs = computed(() => {
    const songs = songStore.state.songs;
    const sheets = sheetStore.state.sheets;
    const planSongs = songStore.state.planSongs;

    const populated = [];

    planSongs.forEach(song => {
        const matchedSong = songs.find((s) => s._id == song._id);
        if (!matchedSong) {
            return;
        }

        matchedSong.pages = [1];
        const populatedSheets = [];
        matchedSong.data.sheetMusic.forEach(sheet => {
            const matchedSheet = sheets.find((s) => s._id == sheet._id);
            if (matchedSheet) {
                populatedSheets.push(matchedSheet);
            }
        });

        matchedSong.sheetMusic = populatedSheets;

        matchedSong.selectedSheet = populatedSheets.find((sheet) => sheet.data?.key == song.key);
        if (!matchedSong.selectedSheet) {
            matchedSong.selectedSheet = populatedSheets[0];
        }

        populated.push(matchedSong);
    })

    return populated;
})

const handleData = (data) => {
    const { id, numPages } = data;
    songPages.value[id] = numPages;
}

const songPages = ref({});

const vertical = useStorage("vertical", false);

const findPages = (song) => {
    if (songPages.value[song._id]) {
        let output = [];
        let count = songPages.value[song._id];
        for (let i = 1; i <= count; i++) {
            output.push(i);
        }
        return output;
    }
    return [1];
}

const drawer = useStorage("drawer", false);
drawer.value = false;

const keySelection = useStorage("keys", {});

</script>

<template>
    <div>
        <Drawer :visible="drawer" header="Options" style="width:30rem;">
            <div v-for="song in populatedSongs" :key="song._id" style="margin-bottom: 2em;">
                <label style="clear:both;display:block;" :for="song._id"><strong>{{ song.title }}</strong></label>
                <Select v-model="keySelection[song._id]" :options="song.sheetMusic" optionLabel="title" optionValue="_id"
                    placeholder="Select a Key" class="w-full md:w-56" />
            </div>
            <label><strong>Scroll Direction</strong></label><br>
            <SelectButton v-model="vertical" :options="options" optionLabel="name" optionValue="value" />
        </Drawer>
        <div class="pdf">
            <Swiper :direction="vertical ? 'vertical' : 'horizontal'">
                <template v-for="song in populatedSongs">
                    <SwiperSlide v-for="page in findPages(song)" :key="song._id + page">
                        <Pdf :page="page" v-if="song.selectedSheet" :source="createURL(song.selectedSheet)"
                            :song="song._id" @data="handleData" />
                    </SwiperSlide>
                </template>
            </Swiper>
        </div>
    </div>
</template>

<style lang="scss">
.pdf {
    height: calc(100vh - 150px);
    width: 100%;
}
</style>