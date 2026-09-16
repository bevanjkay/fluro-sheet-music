<script lang="ts" setup>
import { navigateTo, formatDate } from "#imports";

const serviceStore = useServiceStore();
serviceStore.getServices();

useSeoMeta({
  title: "Service Plans • Fluro Sheet Music Viewer",
});
</script>

<template>
  <page>
    <template v-if="serviceStore.state.services.length">
      <div class="flex flex-col gap-4">
        <Typography variant="h1" size="heading-lg">Upcoming Services</Typography>
        <Message class="w-fit" size="small" severity="secondary">
          <strong>Note:</strong> only services with active plans are shown below.
        </Message>
      </div>
      <div class="flex flex-col gap-4 mt-8">
        <Card v-for="service in serviceStore.state.services" :key="service._id" class="card">
          <template #header>
            <div v-if="service.mainImage" class="image-w-placeholder">
              <img :src="`https://api.fluro.io/get/${service.mainImage._id}`" :alt="service.title"></div>
          </template>
          <template #title>
            {{ service.title }}
          </template>
          <template #subtitle>
            {{ formatDate(service.startDate) }}
          </template>
          <template #footer>
            <div class="flex gap-4 mt-1">
              <Button
v-for="plan in service.plans" :key="plan._id" :label="plan.title" severity="primary" outlined
                class="w-fit" @click="navigateTo(`/plans/${plan._id}`)" />
            </div>
          </template>
        </Card>
      </div>
    </template>
    <div v-else>
      <Typography variant="h3" size="heading-md">Loading services...</Typography>
      <ProgressSpinner />
    </div>
  </page>
</template>
