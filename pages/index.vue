<script lang="ts" setup>
</script>

<template>
  <div class="page">
    <h1>Welcome.</h1>
    <div class="grid row gap-2">
      <Card style="max-width:25em;">
        <template #title>
          View Services
        </template>
        <template #footer>
          <div class="flex gap-4 mt-1">
            <Button
              as="router-link"
              label="Go"
              severity="secondary"
              outlined
              class="w-full"
              to="/plans"
            />
          </div>
        </template>
      </Card>

      <Card style="max-width:25em;">
        <template #title>
          View Songs
        </template>
        <template #footer>
          <div class="flex gap-4 mt-1">
            <Button
              as="router-link"
              label="Go"
              severity="secondary"
              outlined
              class="w-full"
              to="/songs"
            />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
