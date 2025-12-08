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

// Track active slide for lazy loading
const activeIndex = ref(0);
const swiperRef = ref<HTMLElement | null>(null);

// Number of slides to preload before and after the active slide
const PRELOAD_RANGE = 2;

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
    if (count) {
      for (let i = 1; i <= count; i++) {
        output.push(i);
      }
    }
    return output;
  }
  return [1];
};

// Create a flat list of all slides with their indices
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

// Determine if a slide should be loaded based on its proximity to the active slide
const shouldLoadSlide = (slideIndex: number) => {
  return Math.abs(slideIndex - activeIndex.value) <= PRELOAD_RANGE;
};

// Setup swiper event listeners
onMounted(() => {
  nextTick(() => {
    if (swiperRef.value) {
      const swiper = swiperRef.value as HTMLElement & { swiper?: { activeIndex: number } };
      
      // Listen for slide change events
      swiper.addEventListener("slidechange", (event: Event) => {
        const customEvent = event as CustomEvent;
        activeIndex.value = customEvent.detail[0].activeIndex;
      });
      
      // Initialize with first slide
      activeIndex.value = swiper.swiper?.activeIndex ?? 0;
    }
  });
});

onBeforeUnmount(() => {
  songStore.setPopulatedSongs([]);
  songStore.setPlanSongs([]);
  songPages.value = {};
  songLoaded.value = {};
});
</script>

<template>
  <div>
    <div class="pdf">
      <swiper-container
        v-if="songStore.state.planSongs && songStore.state.planSongs.length"
        ref="swiperRef"
        :direction="vertical ? 'vertical' : 'horizontal'"
      >
        <swiper-slide
          v-for="slide in allSlides"
          :key="slide.song._id + slide.page"
        >
          <div v-if="!slide.song.sheetMusic?.length" class="p-12 relative min-h-dvh pt-24" style="min-height: 85vh"> 
            <h1>{{ slide.song.title }}</h1>
            <h3 style="color: darkred">No sheet music for this song.</h3>
          </div>
          <PdfRender
            v-if="slide.song.selectedSheet && slide.song.sheetMusic?.length"
            :page="slide.page"
            :source="createURL(slide.song.selectedSheet)"
            :song="slide.song._id"
            :should-load="shouldLoadSlide(slide.index)"
            @data="handleData"
          />
        </swiper-slide>
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