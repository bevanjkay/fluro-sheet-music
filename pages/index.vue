<script lang="ts" setup>
const props = defineProps<{
  user: User;
}>();
</script>

<template>
  <page>
    <div class="mb-8">
      <typography variant="h1" size="heading-xs" class="font-normal tracking-widest text-xs mb-3">FLURO SHEET MUSIC VIEWER</typography>
      <typography variant="p" size="heading-xl">Welcome {{ props.user.firstName }}.</typography>
      <typography variant="h3" size="heading-sm font-normal">What would you like to do today?</typography>
    </div>
    <div class="flex gap-8" style="width: clamp(200px, 95vw, 960px)">
      <Card class="flex-grow">
        <template #title>
          View Services
        </template>
        <template #footer>
          <div class="flex gap-4 mt-1">
            <Button as="router-link" label="Go" severity="secondary" outlined class="w-fit" to="/plans" />
          </div>
        </template>
      </Card>

      <Card class="flex-grow">
        <template #title>
          View Songs
        </template>
        <template #footer>
          <div class="flex gap-4 mt-1">
            <Button as="router-link" label="Go" severity="secondary" outlined class="w-fit" to="/songs" />
          </div>
        </template>
      </Card>

      <Card class="flex-grow">
        <template #title>
          View Custom Setlists
        </template>
        <template #footer>
          <div class="flex gap-4 mt-1">
            <Button as="router-link" label="Go" severity="secondary" outlined class="w-fit" to="/custom" />
          </div>
        </template>
      </Card>
    </div>
    <AbsoluteFooter>
      Made with ❤️ by <a href="https://bevankay.me" target="_blank">Bevan Kay</a>
    </AbsoluteFooter>
  </page>
</template>
