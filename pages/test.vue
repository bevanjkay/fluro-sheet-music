<script lang="ts" setup>
const songStore = useSongStore();
</script>

<template>
    <div>
        <h3>Test</h3>
        <pre>{{ songStore.songs }}</pre>
    </div>
</template>