<script lang="ts" setup>
import VuePdfEmbed from 'vue-pdf-embed';

const props = defineProps({
    source: String,
    page: Number,
    song: String
})

const emit = defineEmits<{
(e: 'data', value: any): void
}>();

const handleLoaded = ({ numPages }) => {
    emit('data', { id: props.song, numPages })
}

</script>

<template>
    <VuePdfEmbed :source="props.source" :page="props.page" @loaded="handleLoaded"/>
</template>