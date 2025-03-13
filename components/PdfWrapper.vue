<script lang="ts" setup>
import { useStorage } from "@vueuse/core";

const sheetStore = useSheetStore();
const songStore = useSongStore();

const keySelection: Ref<Record<string, string | undefined>> = useStorage("keys", {});
const vertical: Ref<boolean> = useStorage("vertical", false);

const createURL = (sheet: Sheet) => {
  return `https://api.fluro.io/get/${sheet._id}`;
};

const songLoaded: Ref<Record<string, boolean>> = ref({});

const populatedSongs = computed(() => {
  const songs = songStore.state.songs;
  const sheets = sheetStore.state.sheets;
  const planSongs = songStore.state.planSongs;

  const populated: PopulatedSong[] = [];

  planSongs.forEach((song: PlanSong) => {
    const matchedSong: PopulatedSong | undefined = songs.find((s: Song) => s._id == song._id);
    if (!matchedSong) {
      return;
    }

    songLoaded.value[song._id] = false;

    matchedSong.pages = [1];
    const populatedSheets: Sheet[] = [];
    if (!matchedSong.data.sheetMusic) {
      matchedSong.data.sheetMusic = [];
    }
    matchedSong.data.sheetMusic.forEach((sheet) => {
      const matchedSheet = sheets.find((s: Sheet) => s._id == sheet._id);
      if (matchedSheet) {
        populatedSheets.push(matchedSheet);
      }
    });

    matchedSong.sheetMusic = populatedSheets;

    if (keySelection.value[song._id]) {
      matchedSong.selectedSheet = populatedSheets.find((sheet: Sheet) => sheet._id == keySelection.value[song._id]);
    }
    else {
      matchedSong.selectedSheet = populatedSheets.find((sheet: Sheet) => sheet.data?.key == song.key);

      if (!matchedSong.selectedSheet) {
        matchedSong.selectedSheet = populatedSheets[0];
      }
    }

    keySelection.value[song._id] = matchedSong.selectedSheet?._id;

    populated.push(matchedSong);
  });

  songStore.setPopulatedSongs(populated);
  return populated;
});

const handleData = (data: { id: string, numPages: number }) => {
  const { id, numPages } = data;
  songPages.value[id] = numPages;
};

const songPages: Ref<Record<string, number>> = ref({});

const findPages = (song: PopulatedSong) => {
  songLoaded.value[song._id] = true;

  if (songPages.value[song._id]) {
    const output = [];
    const count = songPages.value[song._id];
    for (let i = 1; i <= count; i++) {
      output.push(i);
    }
    return output;
  }
  return [1];
};

onBeforeUnmount(() => {
  songStore.setPopulatedSongs([]);
});
</script>

<template>
  <div>
    <div class="pdf">
      <swiper-container
        v-if="songStore.state.planSongs && songStore.state.planSongs.length"
        :direction="vertical ? 'vertical' : 'horizontal'"
      >
        <template v-for="song in populatedSongs">
          <swiper-slide
            v-for="page in findPages(song)"
            :key="song._id + page"
          >
          <div v-if="!song.sheetMusic?.length" class="p-12 relative min-h-dvh pt-24" style="min-height: 85vh"> 
            <h1>{{ song.title }}</h1>
            <h3 style="color: darkred">No sheet music for this song.</h3>
          </div>
            <PdfRender
              v-if="song.selectedSheet && song.sheetMusic?.length"
              :page="page"
              :source="createURL(song.selectedSheet)"
              :song="song._id"
              @data="handleData"
            />
          </swiper-slide>
        </template>
      </swiper-container>
      <div v-else class="p-12 relative min-h-dvh pt-24">
        <h2>No songs in this plan.</h2>
        <div
class="grid row gap-1 start" style="max-width: 400px;">
        <Button @click="navigateTo('/plans')">View list of service plans</Button>
        <Button @click="navigateTo('/songs')">View list of songs</Button>
        <Button @click="navigateTo('/')">Go Home</Button>
      </div>
      </div>
    </div>
  </div>
</template>
