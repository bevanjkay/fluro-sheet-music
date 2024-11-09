import { useStorage } from "@vueuse/core";

export const useSongStore = defineStore('songStore', () => {
  const state = reactive({
    songs: [],
    planSongs: [],
  });

  async function getSongs() {
    console.log("Fetching songs");
    try {
      if (state.songs.length > 0) return;
      const { data } = await useAsyncFluroData("song", null, { sort: "title" });
      state.songs = data;
    } catch (error) {
      console.error("Error fetching songs", error);
    } 
  }

  function getSong(id) {
    return state.songs.find(song => song._id == id)
  }

  function setPlanSongs(songs) {
    state.planSongs = songs;
  }

  return { state, getSongs, getSong, setPlanSongs }
})