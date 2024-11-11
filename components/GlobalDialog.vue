<script lang="ts" setup>
import { useStorage } from "@vueuse/core";

const songStore = useSongStore();

const vertical: Ref<boolean> = useStorage("vertical", false);

const verticalOptions = [
  { name: "Vertical", value: true },
  { name: "Horizontal", value: false },
];

const keySelection: Ref<Record<string, string>> = useStorage("keys", {});
</script>

<template>
  <div class="container-sm">
    <h2>Options</h2>
    <div
      v-for="song in songStore.state.populatedSongs"
      :key="song._id"
      style="margin-bottom: 2em;"
    >
      <label
        style="clear:both;display:block;"
        :for="song._id"
      ><strong>{{ song.title }}</strong></label>
      <Select
        v-model="keySelection[song._id]"
        :options="song.sheetMusic"
        option-label="title"
        option-value="_id"
        placeholder="Select a Key"
        class="w-full md:w-56"
      />
    </div>
    <label><strong>Scroll Direction</strong></label><br>
    <SelectButton
      v-model="vertical"
      :options="verticalOptions"
      option-label="name"
      option-value="value"
    />
  </div>
</template>
