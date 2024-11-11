<script lang="ts" setup>
const serviceStore = useServiceStore();
serviceStore.getServices();
</script>

<template>
  <div class="page">
    <template v-if="serviceStore.state.services.length">
      <h1>Upcoming Services</h1>
      <Card
        v-for="service in serviceStore.state.services"
        :key="service._id"
        style="width:25em; overflow: hidden; margin-bottom: 2em;"
      >
        <template #header>
          <Image
            v-if="service.mainImage"
            style="background: #eeeeee; aspect-ratio: 16/9; object-fit: cover;"
            width="100%"
            alt="user header"
            :src="`https://api.fluro.io/get/${service.mainImage._id}`"
          />
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
              v-for="plan in service.plans"
              :key="plan._id"
              :label="plan.title"
              severity="secondary"
              outlined
              class="w-full"
              @click="navigateTo(`/plans/${plan._id}`)"
            />
          </div>
        </template>
      </Card>
    </template>
    <div v-else>
      <h2>Loading services...</h2>
      <ProgressSpinner />
    </div>
  </div>
</template>
