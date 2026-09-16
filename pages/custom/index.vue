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
    <div class="flex flex-col gap-4 w-fit">
      <Typography variant="h1" size="heading-lg">Custom Setlists</Typography>
      <Message severity="warning">
        <strong>Note:</strong> Setlists are only stored in your browser. They will be lost if you clear your cache.
      </Message>
      <Button v-if="!create" class="w-fit" label="+ Make New Setlist" @click="create = true" />
    </div>
    <Panel v-if="create" header="Create custom setlist" class="mt-4 relative">
      <Button style="position: absolute; top: 10px; right: 10px;" icon="times" rounded severity="danger" aria-label="Cancel setlist" @click="clear" />
      <div class="mb-4">
        <FloatLabel variant="in">
          <InputText id="title" v-model="setlistForm.title" name="title" />
          <label for="title">Setlist Name</label>
        </FloatLabel>
      </div>
      <div class="flex flex-col gap-2 w-fit">
          <MultiSelect
v-model="selectedSongs" class="start" :options="songStore.state.songs" option-label="title"
            filter placeholder="Choose songs" />
          <Button class="w-fit" @click="addSongs">
            + Add Selected Songs to Setlist
          </Button>
      </div>
      <table v-if="setlistForm.songs.length" class="mt-4 mb-4 w-full text-left text-sm">
        <thead class="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          <tr>
            <th scope="col" class="py-2 pr-4 font-medium">Title</th>
            <th scope="col" class="py-2 pr-4 font-medium">Select Key</th>
            <th scope="col" class="py-2"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="song in setlistForm.songs" :key="song._id" class="border-b border-zinc-100 dark:border-zinc-800">
            <td class="py-2 pr-4">{{ song.title }}</td>
            <td class="py-2 pr-4">
              <Select v-model="selectedKeys[song._id]" :options="keys" placeholder="Key" />
            </td>
            <td class="py-2 text-right">
              <Button severity="secondary" size="small" @click="removeSong(song._id)">
                Remove
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
      <Button
v-if="setlistForm.songs.length" :label="edit ? 'Update Setlist' : 'Create Setlist'"
        @click="createSetlist" />
      <Message v-if="error" severity="error" icon="times-circle" style="margin-bottom: 1em;">
        {{ error }}
      </Message>
    </Panel>
    <template v-if="!create">
      <div class="flex flex-col gap-4 mt-6">
        <Card v-for="setlist in setlists" :key="setlist._id" class="card">
          <template #title>
            <h3 style="margin:0;">
              {{ setlist.title }}
            </h3>
          </template>
          <template #content>
            <strong>Date created:</strong> {{ formatDate(setlist.created) }}
            <p v-if="setlist.songs.length">
              <span v-for="item in setlist.songs" :key="item._id" style="display: block;">{{ item.title }}</span>
            </p>
          </template>
          <template #footer>
            <div class="flex place-content-between">
              <div class="flex gap-2">
                <template v-if="!isDeleting(setlist._id)">
                  <Button label="View Setlist" class="w-fit" @click="navigateTo(`/custom/${setlist._id}`)" />
                  <Button label="Edit Setlist" class="w-fit" @click="editSetlist(setlist)" />
                </template>
              </div>
              <div class="flex-end">
                <Button
v-if="!isDeleting(setlist._id)" severity="danger" outlined
                  @click="deleting[setlist._id] = true">
                  Delete
                </Button>
                <Button
v-if="isDeleting(setlist._id)" style="margin-right: 1em;" severity="danger"
                  @click="deleteSetlist(setlist)">
                  Yes, I'm sure
                </Button>
                <Button
v-if="isDeleting(setlist._id)" severity="secondary"
                  @click="deleting[setlist._id] = false">
                  No, don't delete this
                </Button>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </template>
  </Page>
</template>
