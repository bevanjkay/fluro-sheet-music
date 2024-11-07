<script lang="ts" setup>
import { useStorage } from "@vueuse/core";
import { useFluroData } from '@/utils/fluro'

const route = useRoute();
const id = route.params.id;

interface Plan {
    _id: string
}

const { data: plan, status } = useFluroData("plan", id);

const planSongs = computed(() => {
    if (!plan.value) return [];
    return plan.value.schedules.filter((schedule) => schedule.type == "song");
})

const { data: songs, status: songsStatus } = useFluroData("song");
const { data: sheetMusic, status: sheetMusicStatus } = useFluroData("sheetMusic");

// Once the data is fetched, compile the songs
const songData = ref({});

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
    if (!songs.value || !sheetMusic.value) return [];
    return compileSongs(planSongs.value || []);
})

const keySelection = useStorage(`${id}-keys`, {});
const drawer = ref(false);
const vertical = useStorage("vertical", false);
const options = [
    { name: "Vertical", value: true },
    { name: "Horizontal", value: false }
]

const ready = computed(() => {
    return status.value == "success" && songsStatus.value == "success" && sheetMusicStatus.value == "success";
})
</script>

<template>
    <div>
        <Drawer v-model:visible="drawer" header="Options" style="width:30rem;">
            <div v-for="song in compiledSongs" :key="song._id" style="margin-bottom:1em;">
                <label style="clear: both; display: block;" :for="song._id"><strong>{{ song.title }}</strong></label>
                <Select v-model="keySelection[song._id]" :options="song.sheets" optionLabel="title" optionValue="_id"
                    placeholder="Select a Sheet" class="w-full md:w-56"></Select>
            </div>
            <label><strong>Scroll Direction</strong></label><br>
            <SelectButton v-model="vertical" :options="options" optionLabel="name" optionValue="value" />
        </Drawer>
        <Button severity="secondary" icon="pi pi-cog" @click="drawer = true"></Button>
            <h3 v-if="!ready">Fetching Data</h3>
            <div v-if="ready && !planSongs.length">
                <h3>No songs found for this plan</h3>
            </div>
            <PdfRenderer :songs="compiledSongs" />
    </div>
</template>