<script lang="ts" setup>
import { useStorage } from "@vueuse/core";
import { useFluroData } from '@/utils/fluro'

const route = useRoute();
const id = route.params.id;

interface Plan {
    _id: string
}

const { data: plan, status } = useFluroData("plan", id);

const songs = computed<any[]>(() => {
    if (!plan.value) return [];
    return plan.value.schedules.filter((schedule) => schedule.type == "song");
})

const songStore = useSongStore();

watch(() => plan.value, () => {
    const planSongs = plan.value.schedules.filter((schedule) => schedule.type == "song");
    songStore.setPlanSongs(planSongs);
})

const keySelection = useStorage(`${id}-keys`, {});
const vertical = useStorage("vertical", false);
const options = [
    { name: "Vertical", value: true },
    { name: "Horizontal", value: false }
]
</script>

<template>
    <div>
        <PdfRenderer />
    </div>
</template>