<script lang="ts" setup>
import { useStorage } from '@vueuse/core'

const sheetStore = useSheetStore()
const songStore = useSongStore()

const keySelection: Ref<Record<string, string | undefined>> = useStorage('keys', {})
const vertical: Ref<boolean> = useStorage('vertical', false)

const createURL = (sheet: Sheet) => {
  return `https://api.fluro.io/get/${sheet._id}`
}

const songLoaded: Ref<Record<string, boolean>> = ref({})

const populatedSongs = computed(() => {
  const songs = songStore.state.songs
  const sheets = sheetStore.state.sheets
  const planSongs = songStore.state.planSongs

  const populated: PopulatedSong[] = []

  planSongs.forEach((song: PlanSong) => {
    const matchedSong: PopulatedSong | undefined = songs.find((s: Song) => s._id == song._id)
    if (!matchedSong) {
      return
    }

    songLoaded.value[song._id] = false

    matchedSong.pages = [1]
    const populatedSheets: Sheet[] = []
    matchedSong.data.sheetMusic.forEach((sheet) => {
      const matchedSheet = sheets.find((s: Sheet) => s._id == sheet._id)
      if (matchedSheet) {
        populatedSheets.push(matchedSheet)
      }
    })

    matchedSong.sheetMusic = populatedSheets

    if (keySelection.value[song._id]) {
      matchedSong.selectedSheet = populatedSheets.find((sheet: Sheet) => sheet._id == keySelection.value[song._id])
    }
    else {
      matchedSong.selectedSheet = populatedSheets.find((sheet: Sheet) => sheet.data?.key == song.key)

      if (!matchedSong.selectedSheet) {
        matchedSong.selectedSheet = populatedSheets[0]
      }
    }

    keySelection.value[song._id] = matchedSong.selectedSheet?._id

    populated.push(matchedSong)
  })

  songStore.setPopulatedSongs(populated)
  return populated
})

const handleData = (data: { id: string, numPages: number }) => {
  const { id, numPages } = data
  songPages.value[id] = numPages
}

const songPages: Ref<Record<string, number>> = ref({})

const findPages = (song: PopulatedSong) => {
  songLoaded.value[song._id] = true

  if (songPages.value[song._id]) {
    const output = []
    const count = songPages.value[song._id]
    for (let i = 1; i <= count; i++) {
      output.push(i)
    }
    return output
  }
  return [1]
}

onBeforeUnmount(() => {
  songStore.setPopulatedSongs([])
})
</script>

<template>
  <div>
    <div class="pdf">
      <Swiper
        auto-height
        :direction="vertical ? 'vertical' : 'horizontal'"
      >
        <template v-for="song in populatedSongs">
          <SwiperSlide
            v-for="page in findPages(song)"
            :key="song._id + page"
          >
            <PdfRender
              v-if="song.selectedSheet"
              :page="page"
              :source="createURL(song.selectedSheet)"
              :song="song._id"
              @data="handleData"
            />
          </SwiperSlide>
        </template>
      </Swiper>
    </div>
  </div>
</template>
