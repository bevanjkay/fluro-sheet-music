<script lang="ts" setup>
import { useStorage } from "@vueuse/core";

const setlists: Ref<CustomSetlist[]> = useStorage("setlists", []);

const songStore = useSongStore();

const create = ref(false);
const edit = ref(false);

const setlistForm: Ref<CustomSetlist> = ref({
  title: "",
  songs: [],
  created: null,
});

const selectedSongs: Ref<PlanSong[]> = ref([]);

const addSongs = () => {
  setlistForm.value.songs = [...setlistForm.value.songs, ...selectedSongs.value];
  selectedSongs.value = [];
};

const removeSong = (id: string) => {
  console.log(id);
  setlistForm.value.songs = setlistForm.value.songs.filter((s: PlanSong) => s._id !== id);
};

const selectedKeys: Ref<Record<string, string>> = ref({});

const keys: string[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const error: Ref<string> = ref("");

const createSetlist = (): void => {
  const id = setlistForm.value.title.toLowerCase().replace(/\s/g, "-");

  if (!setlistForm.value.title) {
    error.value = "Please enter a title for your setlist";
    return;
  }

  if (setlists.value.find(s => s._id === id) && !edit.value) {
    error.value = "A setlist with that name already exists, please choose a different name";
    return;
  }

  setlistForm.value.songs.forEach((song: PlanSong) => {
    song.key = selectedKeys.value[song._id];
  });

  setlistForm.value.created = new Date();

  if (edit.value) {
    setlists.value = setlists.value.filter(s => s._id !== id);
  }

  setlists.value = [...setlists.value, { ...setlistForm.value, _id: id }];

  setlistForm.value = {
    title: "",
    songs: [],
    created: null,
  };

  create.value = false;
  edit.value = false;
};

const editSetlist = (setlist: CustomSetlist): void => {
  create.value = true;
  edit.value = true;
  setlistForm.value = setlist;
};

const deleting = ref(false);

const deleteSetlist = (setlist: CustomSetlist): void => {
  setlists.value = setlists.value.filter((s: CustomSetlist) => s._id != setlist._id);
  deleting.value = false;
};
</script>

<template>
  <div class="page">
    <h1>Custom Setlist</h1>
    <Message
      severity="warning"
      style="margin-bottom: 1em;"
    >
      <strong>Note:</strong> Setlists are only stored in your browser. They will be lost if you clear your cache.
    </Message>
    <Button
      v-if="!create"
      label="+ Make New Setlist"
      @click="create = true"
    />
    <Panel
      v-if="create"
      header="Create custom setlist"
    >
      <div style="margin-bottom: 1em;">
        <FloatLabel variant="in">
          <InputText
            v-model="setlistForm.title"
            name="title"
            label="title"
          />
          <label for="title">Setlist Name</label>
        </FloatLabel>
      </div>
      <div class="grid column">
        <div class="start grid column gap-1">
          <MultiSelect
            v-model="selectedSongs"
            class="start"
            :options="songStore.state.songs"
            option-label="title"
            filter
            placeholder="Choose songs"
          />
          <Button
            class="start"
            @click="addSongs"
          >
            + Add Selected Songs to Setlist
          </Button>
        </div>
        <div class="end">
          <Button
            v-if="setlistForm.songs.length"
            @click="setlistForm.songs = []"
          >
            Clear
          </Button>
        </div>
      </div>
      <DataTable
        v-if="setlistForm.songs.length"
        style="margin-bottom:1em;"
        :value="setlistForm.songs"
        table-style="min-width: 50rem"
      >
        <Column
          row-reorder
          header-style="width: 3rem"
          :reorderable-column="false"
        />
        <Column
          field="title"
          header="Title"
        />
        <Column
          field="key"
          header="Select Key"
        >
          <template #body="slotProps">
            <Dropdown
              v-model="selectedKeys[slotProps.data._id]"
              :options="keys"
            />
          </template>
        </Column>
        <Column>
          <template #body="slotProps">
            <Button @click="removeSong(slotProps.data._id)">
              Remove
            </Button>
          </template>
        </Column>
      </DataTable>
      <Button
        v-if="setlistForm.songs.length"
        :label="edit ? 'Update Setlist' : 'Create Setlist'"
        @click="createSetlist"
      />
      <Message
        v-if="error"
        severity="error"
        icon="pi pi-times-circle"
        style="margin-bottom: 1em;"
      >
        {{ error }}
      </Message>
    </Panel>
    <template v-if="!create">
      <Card
        v-for="setlist in setlists"
        :key="setlist._id"
        style="margin-top: 2rem;"
      >
        <template #title>
          <h3 style="margin:0;">
            {{ setlist.title }}
          </h3>
        </template>
        <template #content>
          <strong>Date created:</strong> {{ formatDate(setlist.created) }}
          <p v-if="setlist.songs.length">
            <span
              v-for="item in setlist.songs"
              :key="item._id"
              style="display: block;"
            >{{ item.title }}</span>
          </p>
        </template>
        <template #footer>
          <div class="grid column">
            <div class="start grid column gap-1">
              <Button
                label="View Setlist"
                @click="navigateTo(`/custom/${setlist._id}`)"
              />
              <Button
                label="Edit Setlist"
                @click="editSetlist(setlist)"
              />
            </div>
            <div class="end">
              <Button
                v-if="!deleting"
                severity="secondary"
                class="p-button-danger"
                @click="deleting = true"
              >
                Delete
              </Button>
              <Button
                v-if="deleting"
                style="margin-right: 1em;"
                class="p-button-danger"
                @click="deleteSetlist(setlist)"
              >
                Yes, I'm sure
              </Button>
              <Button
                v-if="deleting"
                severity="secondary"
                class="p-button-grey"
                @click="deleting = false"
              >
                No, don't delete this
              </Button>
            </div>
          </div>
        </template>
      </Card>
    </template>
  </div>
</template>
