<script lang="ts" setup>
import { useStorage } from "@vueuse/core";
import { navigateTo } from "#imports";

const sheetStore = useSheetStore();
const songStore = useSongStore();

const keySelection: Ref<Record<string, string | undefined>> = useStorage("keys", {});
const vertical: Ref<boolean> = useStorage("vertical", false);
const darkMode: Ref<boolean> = useStorage("darkMode", false);

const pdfSurfaceClass = computed(() => ({
  "pdf-surface": true,
  "pdf-surface-dark": darkMode.value,
}));

const createURL = (sheet: Sheet) => {
  return `https://api.fluro.io/get/${sheet._id}`;
};

const songLoaded: Ref<Record<string, boolean>> = ref({});

// Build lookup maps for O(1) access instead of O(n) find() calls
const songMap = computed(() => new Map(songStore.state.songs.map(s => [s._id, s])));
const sheetMap = computed(() => new Map(sheetStore.state.sheets.map(s => [s._id, s])));

// Pure computed - no side effects
const populatedSongs = computed(() => {
  const planSongs = songStore.state.planSongs;
  const populated: PopulatedSong[] = [];

  planSongs.forEach((song: PlanSong) => {
    const baseSong = songMap.value.get(song._id);
    if (!baseSong) {
      return;
    }

    // Create a copy to avoid mutating the original
    const matchedSong: PopulatedSong = { ...baseSong, pages: [1], sheetMusic: [], selectedSheet: undefined };

    // Populate sheet music using Map lookup
    const sheetMusicRefs = matchedSong.data?.sheetMusic || [];
    const populatedSheets: Sheet[] = [];
    sheetMusicRefs.forEach((sheetRef) => {
      const matchedSheet = sheetMap.value.get(sheetRef._id);
      if (matchedSheet) {
        populatedSheets.push(matchedSheet);
      }
    });

    matchedSong.sheetMusic = populatedSheets;

    // Determine selected sheet (read-only from keySelection)
    const savedKey = keySelection.value[song._id];
    if (savedKey) {
      matchedSong.selectedSheet = populatedSheets.find((sheet: Sheet) => sheet._id === savedKey);
    }

    if (!matchedSong.selectedSheet) {
      matchedSong.selectedSheet = populatedSheets.find((sheet: Sheet) => sheet.data?.key === song.key);
    }

    if (!matchedSong.selectedSheet) {
      matchedSong.selectedSheet = populatedSheets[0];
    }

    populated.push(matchedSong);
  });

  return populated;
});

// Handle side effects in a watcher instead of inside the computed
watch(populatedSongs, (populated) => {
  // Update songLoaded state
  populated.forEach((song) => {
    if (!(song._id in songLoaded.value)) {
      songLoaded.value[song._id] = false;
    }
  });

  // Update key selections for songs that don't have one saved
  populated.forEach((song) => {
    if (!keySelection.value[song._id] && song.selectedSheet) {
      keySelection.value[song._id] = song.selectedSheet._id;
    }
  });

  // Update store
  songStore.setPopulatedSongs(populated);
}, { immediate: true });

const handleData = (data: { id: string, numPages: number, sheetId: string }) => {
  const { id, numPages, sheetId } = data;
  const key = `${id}_${sheetId}`;
  songPages.value[key] = numPages;
};

const songPages: Ref<Record<string, number>> = ref({});

const findPages = (song: PopulatedSong) => {
  songLoaded.value[song._id] = true;

  const key = `${song._id}_${song.selectedSheet?._id}`;
  if (songPages.value[key]) {
    const output = [];
    const count = songPages.value[key];
    if (count) {
      for (let i = 1; i <= count; i++) {
        output.push(i);
      }
    }
    return output;
  }
  return [1];
};

const allSlides = computed(() => {
  const slides: Array<{ song: PopulatedSong, page: number, index: number }> = [];
  let index = 0;
  
  populatedSongs.value.forEach((song) => {
    const pages = findPages(song);
    pages.forEach((page) => {
      slides.push({ song, page, index });
      index++;
    });
  });
  
  return slides;
});

onBeforeUnmount(() => {
  songStore.setPopulatedSongs([]);
  songStore.setPlanSongs([]);
  songPages.value = {};
  songLoaded.value = {};
});
</script>

<template>
  <div :class="pdfSurfaceClass">
    <div class="pdf">
      <swiper-container
        v-if="songStore.state.planSongs && songStore.state.planSongs.length"
        :direction="vertical ? 'vertical' : 'horizontal'"
        :keyboard="true"
      >
        <swiper-slide
          v-for="slide in allSlides"
          :key="slide.song._id + slide.page + (slide.song.selectedSheet?._id || '')"
        >
          <div
            v-if="!slide.song.sheetMusic?.length"
            class="relative flex min-h-screen flex-col items-center justify-center px-4 pb-20 pt-24 text-center"
          >
            <Typography variant="h2" size="heading-md">{{ slide.song.title }}</Typography>
            <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">No sheet music has been attached to this song.</p>
          </div>
          <PdfRender
            v-if="slide.song.selectedSheet && slide.song.sheetMusic?.length"
            :page="slide.page"
            :source="createURL(slide.song.selectedSheet)"
            :song="slide.song._id"
            :sheet-id="slide.song.selectedSheet._id"
            @data="handleData"
          />
        </swiper-slide>
      </swiper-container>
      <div v-else class="relative flex min-h-screen flex-col items-center justify-center px-4 pb-20 pt-24 text-center">
        <Typography variant="h2" size="heading-md">No songs in this plan</Typography>
        <p class="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
          Nothing has been scheduled here yet. Pick another service, or open a song directly from the library.
        </p>
        <div class="mt-6 flex flex-wrap justify-center gap-2">
          <Button label="Service plans" @click="navigateTo('/plans')" />
          <Button label="Songs" severity="secondary" @click="navigateTo('/songs')" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pdf-surface {
  min-height: 100vh;
  background: #f4f4f5;
}

.pdf-surface-dark {
  background: #18181b;
}

.pdf-surface :deep(swiper-container),
.pdf-surface :deep(swiper-slide) {
  background: inherit;
}
</style>
