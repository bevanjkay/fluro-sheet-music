import { useStorage } from "@vueuse/core";

export const useSongStore = defineStore("songStore", () => {
  const state = reactive({
    songs: [] as Song[],
    planSongs: [] as PlanSong[],
    populatedSongs: [] as PopulatedSong[],
  });

  const persistedSongs: Ref<Song[]> = useStorage("persistedSongs", state.songs);
  const persistedSongsExpiry: Ref<number> = useStorage("persistedSongsExpiry", 0);

  async function getSongs() {

    if (persistedSongsExpiry.value > Date.now()) {
      if (state.songs.length > 0) {
        state.songs = persistedSongs.value;
        return;
      }
    }

    try {
      const { data } = await useAsyncFluroData("song", null, { sort: "title" }) as { data: Ref<Song[]> };
      state.songs = data.value;
    }
    catch (error) {
      console.error("Error fetching songs", error);
    }
  }

  function getSong(id: string) {
    return state.songs.find(song => song._id == id);
  }

  function setPlanSongs(songs: PlanSong[]) {
    state.planSongs = songs;
  }

  function setPopulatedSongs(songs: PopulatedSong[]) {
    state.populatedSongs = songs;
  }

  watch(() => state.songs, () => {
    persistedSongs.value = state.songs;
    persistedSongsExpiry.value = Date.now() + 24 * 60 * 60;
  });

  const clearCache = () => {
    persistedSongs.value = [];
    persistedSongsExpiry.value = 0;
  };

  return { state, getSongs, getSong, setPlanSongs, setPopulatedSongs, clearCache };
});
