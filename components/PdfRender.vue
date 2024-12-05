<script lang="ts" setup>
import { defineProps, defineEmits } from "vue";
import VuePdfEmbed from "vue-pdf-embed";
import { useStorage, type RemovableRef } from "@vueuse/core";

const props = defineProps({
  source: {
    type: String,
    default: "",
  },
  page: {
    type: Number,
    default: 1,
  },
  song: {
    type: String,
    default: "",
  },
});

const emit = defineEmits<{
  (e: "data", value: { id: string, numPages: number }): void
}>();

const handleLoaded = ({ numPages }: { numPages: number }): void => {
  emit("data", { id: props.song, numPages });
  key.value = Math.random();
};

const key = ref(Math.random());

const user: RemovableRef<User> = useStorage("_fluro_user", { token: "", refreshToken: "" });


const source = computed(() => {
  return `${props.source}?access_token=${user.value.token}`;
});
</script>

<template>
  <VuePdfEmbed
    :source="source"
    :page="props.page"
    @loaded="handleLoaded"
  />
</template>
