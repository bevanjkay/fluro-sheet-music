<script lang="ts" setup>
import { getUserSession, refresh } from "./utils/login";
import { useStorage } from "@vueuse/core";

const user = useStorage("_fluro_user", {});
const session = ref(null);

onBeforeMount(async () => {
  console.log("User", user.value)
  if (!user.value) return;
  try {
    const response = await getUserSession(user.value);
    console.log(response);
  } catch (error) {
    try {
      console.log("Refreshing token", user.value.refreshToken);
      const response = await refresh(user.value.refreshToken);
      user.value.token = response.token;
    } catch (e) {
      console.error(error);
      console.error(e);
      user.value = {};
    }
  }
})


const expiry = computed(() => {
  if (!session.value) return null;
  const now = new Date();
  const expires = new Date(user.value.expires);
  return Math.floor((expires.getTime() - now.getTime()) / 1000);
})

const visible = ref(false);

const items = ref([
  {
    label: "Home",
    icon: "pi pi-fw pi-home",
    command: () => {
      navigateTo("/");
    },
  },
  {
    label: "Service Plans",
    icon: "pi pi-fw pi-calendar",
    command: () => {
      navigateTo("/plans");
    },
  },
  {
    label: "Songs",
    icon: "pi pi-fw pi-list",
    command: () => {
      navigateTo("/songs");
    },
  },
  {
    label: "Settings",
    icon: "pi pi-fw pi-cog",
    command: () => {
      drawer.value = true;
    },
  }
]);

const drawer = useStorage("drawer", false);

</script>

<template>
  <div>
    <Menubar :model="items">
      <template #end>
        <div class="flex">
          <Button @click="user = {}">Logout</Button>
        </div>
      </template>
    </Menubar>
    <NuxtPage style="padding:25px;" />
  </div>
</template>

<style scoped>
* {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.flex {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style>
