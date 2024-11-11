<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'

const props = defineProps({
  source: {
    type: String,
    default: '',
  },
  page: {
    type: Number,
    default: 1,
  },
  song: {
    type: String,
    default: '',
  },
})

const emit = defineEmits<{
  (e: 'data', value: { id: string, numPages: number }): void
}>()

const handleLoaded = ({ numPages }: { numPages: number }): void => {
  emit('data', { id: props.song, numPages })
}
</script>

<template>
  <VuePdfEmbed
    :source="props.source"
    :page="props.page"
    @loaded="handleLoaded"
  />
</template>
