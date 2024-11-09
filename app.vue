<script lang="ts" setup>
import { getUserSession, refresh } from "./utils/login";
import { useStorage } from "@vueuse/core";
import Dialog from "@/components/Dialog.vue";

const user = useStorage("_fluro_user", {});
const session = ref(null);
const loading = ref(true);

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
      user.value = {};
    }
  }
})

const songStore = useSongStore();
const sheetStore = useSheetStore();

onMounted(async () => {

  if (user.value) {
    await songStore.getSongs();
    await sheetStore.getSheets();
  }

  loading.value = false;
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
    label: "Custom Setlists",
    icon: "pi pi-fw pi-th-large",
    command: () => {
      navigateTo("/custom");
    },
  },
  {
    label: "Settings",
    icon: "pi pi-fw pi-cog",
    command: () => {
      dialog.open(Dialog, {})
    },
  }
]);

const dialog = useDialog();

const logout = () => {
  user.value = {};
  navigateTo("/login");
}
</script>

<template>
  <div>
    <DynamicDialog />
    <Menubar :model="items">
      <template #end>
        <div class="flex">
          <Button @click="logout">Logout</Button>
        </div>
      </template>
    </Menubar>
    <div v-if="loading" style="padding:25px;">
      <h2>Loading data...</h2>
      <ProgressSpinner />
    </div>
    <NuxtPage v-if="!loading" style="padding:25px; background: #f7f9fb;" />
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
