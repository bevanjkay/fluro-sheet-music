<script lang="ts" setup>
import { useStorage } from "@vueuse/core";
import { navigateTo, formatDate } from "#imports";

const setlists: Ref<CustomSetlist[]> = useStorage("setlists", []);

const songStore = useSongStore();

useSeoMeta({
  title: "Custom Setlists • Fluro Sheet Music Viewer",
});

const create = ref(false);
const edit = ref(false);

const setlistForm: Ref<CustomSetlist> = ref({
  title: "",
  songs: [],
  created: null,
  _id: "",
});

const selectedSongs: Ref<Song[]> = ref([]);

// The picker yields Song records; setlists store PlanSong, the same shape a
// service plan schedule produces, so sheet-by-key matching works either way.
const addSongs = () => {
  const additions: PlanSong[] = selectedSongs.value.map(song => ({
    _id: song._id,
    title: song.title,
    key: song.data?.key ?? "",
    type: "song",
  }));
  setlistForm.value.songs = [...setlistForm.value.songs, ...additions];
  selectedSongs.value = [];
};

const removeSong = (id: string) => {
  setlistForm.value.songs = setlistForm.value.songs.filter((s: PlanSong) => s._id !== id);
};

const selectedKeys: Ref<Record<string, string>> = ref({});

const keys: string[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const error: Ref<string> = ref("");

const editingId: Ref<string | null> = ref(null);

const createSetlist = (): void => {
  error.value = "";
  const id = setlistForm.value.title.toLowerCase().replace(/\s/g, "-");

  if (!setlistForm.value.title) {
    error.value = "Please enter a title for your setlist";
    return;
  }

  if (setlists.value.find(s => s._id === id) && id !== editingId.value) {
    error.value = "A setlist with that name already exists, please choose a different name";
    return;
  }

  setlistForm.value.songs.forEach((song: PlanSong) => {
    song.key = selectedKeys.value[song._id] ?? song.key;
  });

  setlistForm.value.created = new Date();

  if (edit.value) {
    setlists.value = setlists.value.filter(s => s._id !== editingId.value);
  }

  setlists.value = [...setlists.value, { ...setlistForm.value, _id: id }];

  setlistForm.value = {
    title: "",
    songs: [],
    created: null,
    _id: "",
  };

  create.value = false;
  edit.value = false;
  editingId.value = null;
};

const editSetlist = (setlist: CustomSetlist): void => {
  create.value = true;
  edit.value = true;
  editingId.value = setlist._id;
  // Clone so cancelling the edit doesn't leave changes on the saved setlist
  setlistForm.value = { ...setlist, songs: setlist.songs.map(song => ({ ...song })) };
};

const deleting: Ref<Record<string, boolean>> = ref({});

const deleteSetlist = (setlist: CustomSetlist): void => {
  setlists.value = setlists.value.filter((s: CustomSetlist) => s._id != setlist._id);
  deleting.value[setlist._id] = false;
};

const isDeleting = (id: string): boolean => {
  return deleting.value[id] || false;
};

const clear = () => {
  setlistForm.value = {
    title: "",
    songs: [],
    created: null,
    _id: "",
  };
  create.value = false;
  edit.value = false;
  editingId.value = null;
  error.value = "";
};
</script>

<template>
  <Page>
    <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <Typography variant="h1" size="heading-lg">Custom setlists</Typography>
        <p class="mt-2 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
          Setlists are saved on this device only. Clearing your browser data removes them.
        </p>
      </div>
      <Button v-if="!create" icon="plus" label="New setlist" class="w-fit shrink-0" @click="create = true" />
    </div>

    <Panel v-if="create" :header="edit ? 'Edit setlist' : 'New setlist'" class="relative">
      <Button
        class="absolute right-3 top-3"
        icon="times"
        variant="text"
        severity="secondary"
        rounded
        aria-label="Cancel and close editor"
        @click="clear"
      />

      <div class="mb-5 max-w-sm">
        <FloatLabel variant="in">
          <InputText id="title" v-model="setlistForm.title" name="title" />
          <label for="title">Setlist name</label>
        </FloatLabel>
      </div>

      <div class="mb-5 flex flex-wrap items-center gap-2">
        <MultiSelect
          v-model="selectedSongs"
          :options="songStore.state.songs"
          option-label="title"
          filter
          placeholder="Choose songs"
        />
        <Button severity="secondary" :disabled="!selectedSongs.length" @click="addSongs">
          Add {{ selectedSongs.length || "" }} to setlist
        </Button>
      </div>

      <div v-if="setlistForm.songs.length" class="mb-5 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th scope="col" class="px-4 py-2.5 font-medium">Song</th>
              <th scope="col" class="px-4 py-2.5 font-medium">Key</th>
              <th scope="col" class="px-4 py-2.5"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
            <tr v-for="song in setlistForm.songs" :key="song._id">
              <td class="px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-50">{{ song.title }}</td>
              <td class="px-4 py-2.5">
                <Select
                  v-model="selectedKeys[song._id]"
                  :options="keys"
                  :placeholder="song.key || 'Key'"
                  :aria-label="`Key for ${song.title}`"
                  class="w-28"
                />
              </td>
              <td class="px-4 py-2.5 text-right">
                <Button
                  severity="secondary"
                  icon="trash"
                  :aria-label="`Remove ${song.title}`"
                  @click="removeSong(song._id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="mb-5 rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        No songs yet. Choose songs above to build your running order.
      </p>

      <Message v-if="error" severity="error" icon="times-circle" class="mb-4">
        {{ error }}
      </Message>

      <div class="flex gap-2">
        <Button
          :disabled="!setlistForm.songs.length"
          :label="edit ? 'Update setlist' : 'Create setlist'"
          @click="createSetlist"
        />
        <Button label="Cancel" severity="secondary" @click="clear" />
      </div>
    </Panel>

    <template v-if="!create">
      <div v-if="setlists.length" class="grid items-start gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <Card v-for="setlist in setlists" :key="setlist._id">
          <template #title>
            {{ setlist.title }}
          </template>
          <template #subtitle>
            {{ setlist.songs.length }} {{ setlist.songs.length === 1 ? "song" : "songs" }} &middot; created {{ formatDate(setlist.created) }}
          </template>
          <template #content>
            <ul v-if="setlist.songs.length" class="space-y-1 text-sm">
              <li v-for="item in setlist.songs" :key="item._id" class="flex items-baseline justify-between gap-3">
                <span class="min-w-0 truncate text-zinc-700 dark:text-zinc-300">{{ item.title }}</span>
                <span v-if="item.key" class="shrink-0 text-xs font-semibold text-zinc-500 dark:text-zinc-400">{{ item.key }}</span>
              </li>
            </ul>
            <p v-else class="text-sm text-zinc-500 dark:text-zinc-400">No songs in this setlist.</p>
          </template>
          <template #footer>
            <div v-if="!isDeleting(setlist._id)" class="flex flex-wrap items-center gap-2">
              <Button label="Open" @click="navigateTo(`/custom/${setlist._id}`)" />
              <Button label="Edit" severity="secondary" icon="pencil" @click="editSetlist(setlist)" />
              <Button
                class="ml-auto"
                variant="text"
                severity="secondary"
                icon="trash"
                :aria-label="`Delete ${setlist.title}`"
                @click="deleting[setlist._id] = true"
              />
            </div>
            <div v-else class="flex flex-wrap items-center gap-2">
              <p class="w-full text-sm text-zinc-600 dark:text-zinc-400">Delete &ldquo;{{ setlist.title }}&rdquo;?</p>
              <Button label="Delete" severity="danger" @click="deleteSetlist(setlist)" />
              <Button label="Keep" severity="secondary" @click="deleting[setlist._id] = false" />
            </div>
          </template>
        </Card>
      </div>

      <div v-else class="rounded-xl border border-dashed border-zinc-300 px-5 py-12 text-center dark:border-zinc-700">
        <Typography variant="h2" size="heading-sm">No setlists yet</Typography>
        <p class="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
          Build your own running order for rehearsals, team nights, and anything without a Fluro plan.
        </p>
        <div class="mt-5 flex justify-center">
          <Button icon="plus" label="New setlist" @click="create = true" />
        </div>
      </div>
    </template>
  </Page>
</template>
