<script lang="ts" setup>
import { defineProps, defineEmits } from "vue";
import { useStorage, type RemovableRef } from "@vueuse/core";
import { VuePDF, usePDF } from "@tato30/vue-pdf";

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

const key = ref(Math.random());

const user: RemovableRef<User> = useStorage("_fluro_user", { token: "", refreshToken: "" });

const source = computed(() => {
  return `${props.source}?access_token=${user.value.token}`;
});

const { pdf, pages } = usePDF(source);

watch(pages, (newPages: number) => {
  if (newPages > 0) {
    emit("data", { id: props.song, numPages: newPages });
  }
}, { immediate: true });

</script>

<template>
  <VuePDF :key="key" :pdf="pdf" intent="display" :page="page" fit-parent />
</template>
