<script lang="ts" setup>
import { useStorage } from "@vueuse/core";
import { useFluroData } from '@/utils/fluro'

const route = useRoute();
const id = route.params.id;

const { data: song, status } = useFluroData("song", id);

const sheetMusicIds = computed(() => {
    if (!song.value) return [];
    return song.value.data.sheetMusic.map((sheet) => sheet._id);
})

const sheetMusic = ref([]);

watch(sheetMusicIds, async (newIds, oldIds) => {
    const { data, status: sheetMusicStatus } = await useFluroData("sheetMusic", sheetMusicIds.value);
    sheetMusic.value = data.value;
})


const compileSongs = (input) => {
    const hydratedSongs = input.map(song => {
        const hydratedSong = songs.value.find((s) => s._id == song._id);

        const hydratedSheets = hydratedSong.data.sheetMusic.map((sheet) => {
            const matchedSheet = sheetMusic.value.find((s) => s._id == sheet._id);
            return matchedSheet
        })

        if (song.key) {
            if (!keySelection.value[song._id]) {
                const matched = hydratedSheets.find((sheet) => sheet.data.key == song.key);
                keySelection.value[song._id] = matched._id;
            }
        }

        hydratedSong.sheets = hydratedSheets;
        hydratedSong.selectedSheet = hydratedSheets.find((sheet) => sheet._id == keySelection.value[song._id]);
        return hydratedSong;
    });

    return hydratedSongs;
}

const compiledSongs = computed(() => {
    console.log(song.value, sheetMusic.value);
    if (!song.value || !sheetMusic.value) return [];
    song.value.sheets = sheetMusic.value;
    if (keySelection.value[song.value._id]) {
        song.value.selectedSheet = sheetMusic.value.find((sheet) => sheet._id == keySelection.value[song.value._id]);
    } else {
        song.value.selectedSheet = sheetMusic.value[0];
        keySelection.value[song.value._id] = song.value.selectedSheet._id;
    }
    return [song.value]
})

const keySelection = useStorage(`${id}-keys`, {});

const drawer = useStorage("drawer", false);
const vertical = useStorage("vertical", false);
const options = [
    { name: "Vertical", value: true },
    { name: "Horizontal", value: false }
]
</script>

<template>
    <div style="position: relative;">
        <Drawer v-model:visible="drawer" header="Options" style="width:30rem;">
            <div v-for="song in compiledSongs" :key="song._id" style="margin-bottom: 2em;">
                <label style="clear:both;display:block;" :for="song._id"><strong>{{ song.title }}</strong></label>
                <Select v-model="keySelection[song._id]" :options="song.sheets" optionLabel="title" optionValue="_id" placeholder="Select a City" class="w-full md:w-56" />
            </div>
            <label><strong>Scroll Direction</strong></label><br>
            <SelectButton v-model="vertical" :options="options" optionLabel="name" optionValue="value" />                <!-- <USelectMenu v-model="keySelection[song._id]" :options="song.sheets" option-attribute="title" value-attribute="_id" /> -->
        </Drawer>
        <h3 v-if="status == 'pending'">Fetching Data</h3>
        <div v-else>

            <!-- <pre>{{ compiledSongs }}</pre> -->
            <PdfRenderer :songs="compiledSongs" :vertical="vertical" />
        </div>
    </div>
</template>