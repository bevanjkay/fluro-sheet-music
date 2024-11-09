<script lang="ts" setup>
import { set, useStorage } from "@vueuse/core";
const setlists = useStorage("setlists", []);

const songStore = useSongStore();

const create = ref(false);
const edit = ref(false);

const setlistForm = ref({
    title: "",
    songs: [],
    created: null,
})

const selectedSongs = ref([]);

const addSongs = () => {
    setlistForm.value.songs = [...setlistForm.value.songs, ...selectedSongs.value];
    selectedSongs.value = [];
}

const removeSong = (id) => {
    console.log(id);
    setlistForm.value.songs = setlistForm.value.songs.filter(s => s._id !== id);
}

const selectedKeys = ref({});

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const error = ref("");
const createSetlist = () => {

    const id = setlistForm.value.title.toLowerCase().replace(/\s/g, "-");

    if (!setlistForm.value.title) {
        error.value = "Please enter a title for your setlist";
        return;
    }

    if (setlists.value.find(s => s._id === id) && !edit.value) {
        error.value = "A setlist with that name already exists, please choose a different name";
        return;
    }

    setlistForm.value.songs.forEach(song => {
        song.key = selectedKeys.value[song._id];
    })


    setlistForm.value.created = new Date();

    if (edit.value) {
        setlists.value = setlists.value.filter(s => s._id !== id);
    }

    setlists.value = [...setlists.value, { ...setlistForm.value, _id: id }];

    setlistForm.value = {
        title: "",
        songs: [],
        created: null,
    }

    create.value = false;
    edit.value = false;
}

const editSetlist = (setlist) => {
    create.value = true;
    edit.value = true;
    setlistForm.value = setlist;
}

const deleteSetlist = (setlist) => {
    setlists.value = setlists.value.filter(s => s._id !== setlist._id);
}
</script>

<template>
    <div>
        <h1>Custom Setlist</h1>
        <Message severity="warning" style="margin-bottom: 1em;">
            <strong>Note:</strong> Setlists are only stored in your browser. They will be lost if you clear your cache.
        </Message>
        <Button v-if="!create" @click="create = true" label="+ Make New Setlist" />
        <Panel v-if="create" header="Create custom setlist">
            <div style="margin-bottom: 1em;">
                <FloatLabel variant="in">
                    <InputText name="title" label="title" v-model="setlistForm.title"></InputText>
                    <label for="title">Setlist Name</label>
                </FloatLabel>
            </div>
            <div class="grid column">
                <div class="start grid column gap-1">
                    <MultiSelect class="start" v-model="selectedSongs" :options="songStore.state.songs"
                        optionLabel="title" filter placeholder="Choose songs" />
                    <Button class="start" @click="addSongs">+ Add Selected Songs to Setlist</Button>
                </div>
                <div class="end">
                    <Button v-if="setlistForm.songs.length" @click="setlistForm.songs = []">Clear</Button>
                </div>
            </div>
            <DataTable style="margin-bottom:1em;" v-if="setlistForm.songs.length" :value="setlistForm.songs"
                tableStyle="min-width: 50rem">
                <Column rowReorder headerStyle="width: 3rem" :reorderableColumn="false" />
                <Column field="title" header="Title"></Column>
                <Column field="key" header="Select Key">
                    <template #body="slotProps">
                        <Dropdown :options="keys" v-model="selectedKeys[slotProps.data._id]"></Dropdown>
                    </template>
                </Column>
                <Column>
                    <template #body="slotProps">
                        <Button @click="removeSong(slotProps.data._id)">Remove</Button>
                    </template>
                </Column>
            </DataTable>
            <Button v-if="setlistForm.songs.length" @click="createSetlist"
                :label="edit ? 'Update Setlist' : 'Create Setlist'" />
            <Message v-if="error" severity="error" icon="pi pi-times-circle" style="margin-bottom: 1em;">
                {{ error }}
            </Message>
        </Panel>
        <template v-if="!create">
            <Card style="margin-top: 2rem;" v-for="setlist in setlists" :key="setlist._id">
                <template #title>
                    <h3 style="margin:0;">{{ setlist.title }}</h3>
                </template>
                <template #content>
                    <p v-if="setlist.songs.length">{{ setlist.songs.map(s => s.title).join("<br>") }}</p>
                </template>
                <template #footer>
                    <div class="grid column">
                        <div class="start grid column gap-1">
                            <Button @click="navigateTo(`/custom/${setlist._id}`)" label="View Setlist" />
                            <Button @click="editSetlist(setlist)" label="Edit Setlist" />
                        </div>
                        <div class="end">
                            <Button @click="deleteSetlist(setlist)" class="p-button-danger">Delete</Button>
                        </div>
                    </div>
                </template>
            </Card>
        </template>
    </div>
</template>