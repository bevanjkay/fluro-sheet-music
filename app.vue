<script lang="ts" setup>
import { useStorage } from "@vueuse/core";
import GlobalDialog from "@/components/GlobalDialog.vue";

const user: Ref<User> = useStorage("_fluro_user", { token: "", refreshToken: "" });
const darkMode: Ref<boolean> = useStorage("darkMode", false);

useSeoMeta({
  title: "Fluro Sheet Music Viewer",
  ogTitle: "Fluro Sheet Music Viewer",
});

const { bootstrap, pending: bootstrapPending, reset: resetBootstrap } = useAppBootstrap();

const setDarkMode = (value: boolean) => {
  const root = document.documentElement;
  if (value) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

onMounted(async () => {
  // Clear expired cache entries on startup to free memory
  clearExpiredCache();
  
  // Check localStorage capacity and warn if approaching limit
  if (checkLocalStorageCapacity()) {
    toast.add({
      severity: "warn",
      summary: "Storage Warning",
      detail: "App cache is large. Consider clearing cache in settings.",
      life: 5000,
    });
  }

  if (user.value.token) {
    void bootstrap().catch((bootstrapError: unknown) => {
      console.error("Error bootstrapping app data", bootstrapError);
    });
  }

  setDarkMode(darkMode.value);
});

const menuItems = ref([
  {
    label: "Home",
    icon: "home",
    to: "/",
    command: () => {
      navigateTo("/");
    },
  },
  {
    label: "Service Plans",
    icon: "calendar",
    to: "/plans",
    command: () => {
      navigateTo("/plans");
    },
  },
  {
    label: "Songs",
    icon: "list",
    to: "/songs",
    command: () => {
      navigateTo("/songs");
    },
  },
  {
    label: "Custom Setlists",
    icon: "grid",
    to: "/custom",
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
    icon: "exclamation-triangle",
    acceptLabel: "Logout",
    accept: () => {
      resetBootstrap();
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

const showBootstrapState = computed(() => Boolean(user.value.token) && bootstrapPending.value);
</script>

<template>
  <div>
    <DynamicDialog />
    <ConfirmDialog />
    <Toast />
    <div v-if="user?.token" class="app-header">
      <Menubar class="w-full" :model="menuItems">
        <template #end>
          <div class="flex flex-row items-center gap-2">
            <Button icon="settings" variant="text" severity="secondary" aria-label="Settings" @click="settings">
              <span class="hidden sm:inline">Settings</span>
            </Button>
            <Button icon="sign-out" aria-label="Logout" @click="logout">
              <span class="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </template>
      </Menubar>
    </div>
    <page v-if="showBootstrapState" class="app-loading-state">
      <Typography variant="h3" size="heading-md">Syncing library...</Typography>
      <ProgressSpinner />
    </page>
    <NuxtPage v-else />
  </div>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 20;
  padding: 0.5rem;
}

.app-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding-top: 6rem;
}
</style>
