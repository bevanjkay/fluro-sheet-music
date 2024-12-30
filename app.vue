<script lang="ts" setup>
import { useStorage } from "@vueuse/core";
import { getUserSession, refresh } from "./utils/login";
import GlobalDialog from "@/components/GlobalDialog.vue";

const user: Ref<User> = useStorage("_fluro_user", { token: "", refreshToken: "" });
const loading: Ref<boolean> = ref(true);
const darkMode: Ref<boolean> = useStorage("darkMode", false);

  useSeoMeta({
  title: "Fluro Sheet Music Viewer",
  ogTitle: "Fluro Sheet Music Viewer",
});

onBeforeMount(async () => {
  if (!user.value) return;
  try {
    const response = await getUserSession(user.value);
    console.log(response);
  }
  catch {
    try {
      console.log("Refreshing token", user.value.refreshToken);
      const response = await refresh(user.value.refreshToken);
      user.value.token = response.token;
    }
    catch {
      user.value = {
        token: "",
        refreshToken: "",
      };
    }
  }
});

const songStore = useSongStore();
const sheetStore = useSheetStore();

const setDarkMode = (value: boolean) => {
  const root = document.documentElement;
  if (value) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

onMounted(async () => {
  if (user.value) {
    await songStore.getSongs();
    await sheetStore.getSheets();
  }

  setDarkMode(darkMode.value);
  loading.value = false;

});

const menuItems = ref([
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
]);

const dialog = useDialog();
const confirm = useConfirm();
const toast = useToast();

const logout = () => {
  confirm.require({
    header: "Logout",
    message: "Are you sure you want to logout?",
    icon: "pi pi-exclamation-triangle",
    accept: () => {
      user.value = {
        token: "",
        refreshToken: "",
      };
      toast.add({
        severity: "success",
        summary: "Logged out",
        detail: "You have been logged out.",
        life: 3000,
      });
      navigateTo("/login");
    },
  });
};

const settings = () => {
  dialog.open(GlobalDialog, {});
};

watch(darkMode, (value) => {
  setDarkMode(value);
});
</script>

<template>
  <div>
    <DynamicDialog />
    <ConfirmDialog />
    <Toast />
    <div class="absolute p-2 z-20 w-full">
      <Menubar v-if="user?.token" class="w-full" :model="menuItems">
        <template #end>
          <div class="flex flex-row gap-4">
            <Button icon="pi pi-cog" variant="text" label="Settings" severity="secondary" @click="settings" />
            <Button label="Logout" icon="pi pi-sign-out" @click="logout" />
          </div>
        </template>
      </Menubar>
    </div>
    <page v-if="loading">
      <Typography variant="h3" size="heading-md">Loading data...</Typography>
      <ProgressSpinner />
    </page>
    <NuxtPage v-if="!loading" :user="user" />
  </div>
</template>