export const useSongStore = defineStore('songStore', () => {
  const state = reactive({
    songs: [] as Song[],
    planSongs: [] as PlanSong[],
    populatedSongs: [] as PopulatedSong[],
  })

  async function getSongs() {
    try {
      if (state.songs.length > 0) return
      const { data } = await useAsyncFluroData('song', null, { sort: 'title' }) as { data: Ref<Song[]> }
      state.songs = data.value
    }
    catch (error) {
      console.error('Error fetching songs', error)
    }
  }

  function getSong(id: string) {
    return state.songs.find(song => song._id == id)
  }

  function setPlanSongs(songs: PlanSong[]) {
    state.planSongs = songs
  }

  function setPopulatedSongs(songs: PopulatedSong[]) {
    state.populatedSongs = songs
  }

  return { state, getSongs, getSong, setPlanSongs, setPopulatedSongs }
})
