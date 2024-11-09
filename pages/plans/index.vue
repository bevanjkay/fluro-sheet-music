<script lang="ts" setup>
const serviceStore = useServiceStore();
serviceStore.getServices();
</script>

<template>
    <div>
        <h3 v-if="status == 'pending'">Fetching Data</h3>
        <div v-for="service in serviceStore.state.services" :key="service._id">
            <!-- <pre>{{ service }}</pre> -->
            <Card style="width:25em; overflow: hidden; margin-bottom: 2em;">
                <template #header>
                    <Image width="100%" v-if="service.mainImage" alt="user header" :src="`https://api.fluro.io/get/${service.mainImage._id}`" />
                </template>
                <template #title>{{ service.title }}</template>
                <template #subtitle>{{ formatDate(service.startDate) }}</template>
                <template #footer>
                    <div class="flex gap-4 mt-1">
                        <Button v-for="plan in service.plans" @click="navigateTo(`/plans/${plan._id}`)" :key="plan._id" :label="plan.title" severity="secondary"
                            outlined class="w-full" />
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>