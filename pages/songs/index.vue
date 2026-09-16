<script lang="ts" setup>
const songStore = useSongStore();

onMounted(() => {
  if (songStore.state.songs.length === 0) {
    songStore.getSongs();
  };
});

const query = ref("");

const filteredSongs = computed(() => {
  if (!query.value) return songStore.state.songs;
  const needle = query.value.toLowerCase();
  return songStore.state.songs.filter((song: Song) =>
    song.title.toLowerCase().includes(needle)
    || (song.data?.firstLine || "").toLowerCase().includes(needle));
});

useSeoMeta({
  title: "Songs • Fluro Sheet Music Viewer",
});
</script>

<template>
  <page>
    <div class="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <Typography variant="h1" size="heading-lg">Songs</Typography>
      <p class="text-sm text-zinc-500 dark:text-zinc-400">
        {{ filteredSongs.length }} of {{ songStore.state.songs.length }} songs
      </p>
    </div>

    <div class="relative mb-6">
      <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
        <AppIcon name="search" :size="18" />
      </span>
      <input
        v-model="query"
        type="search"
        aria-label="Search songs"
        placeholder="Search by title or first line"
        class="w-full rounded-lg border border-zinc-300 bg-white py-3 pl-10 pr-3 text-base text-zinc-900 transition-colors placeholder:text-zinc-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      >
    </div>

    <p v-if="!songStore.state.songs.length" class="rounded-xl border border-dashed border-zinc-300 px-5 py-10 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
      Your song library is still syncing.
    </p>
    <p v-else-if="!filteredSongs.length" class="rounded-xl border border-dashed border-zinc-300 px-5 py-10 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
      No songs match &ldquo;{{ query }}&rdquo;.
    </p>

    <ul v-else class="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      <li v-for="song in filteredSongs" :key="song._id">
        <NuxtLink
          :to="`/songs/${song._id}`"
          class="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-400 dark:hover:bg-zinc-900 sm:px-5"
        >
          <span class="min-w-0 flex-1">
            <span class="block text-base font-semibold text-zinc-900 line-clamp-2 dark:text-zinc-50">{{ song.title }}</span>
            <span v-if="song.data?.firstLine" class="mt-0.5 block truncate text-sm text-zinc-500 dark:text-zinc-400">{{ song.data.firstLine }}</span>
          </span>
          <span
            v-if="song.data?.key"
            class="w-10 shrink-0 rounded-md bg-zinc-100 px-2 py-1 text-center text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            :title="`Default key: ${song.data.key}`"
          >{{ song.data.key }}</span>
          <AppIcon name="chevron-right" :size="18" class="shrink-0 text-zinc-400" />
        </NuxtLink>
      </li>
    </ul>
  </page>
</template>
