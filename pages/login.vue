<script setup lang="ts">
import { useStorage  } from "@vueuse/core";
import type {RemovableRef} from "@vueuse/core";
import { login } from "@/utils/login";

const user: RemovableRef<User> = useStorage("_fluro_user", { token: "", refreshToken: "" });
const username: Ref<string> = ref<string>("");
const password: Ref<string> = ref<string>("");
const error: Ref<string> = ref("");
const pending: Ref<boolean> = ref(false);
const { bootstrap, reset: resetBootstrap } = useAppBootstrap();

onBeforeMount(() => {
  if (isAuthenticated()) {
    navigateTo({ path: "/", replace: true });
  }
});

const songStore = useSongStore();
const sheetStore = useSheetStore();

const useLogin = async (): Promise<void> => {
  pending.value = true;

  try {
    const response = await login(username.value, password.value);
    if (response.token) {
      user.value.token = response.token;
      user.value.refreshToken = response.refreshToken;

      await getUserSession(user.value);
      songStore.clearCache();
      sheetStore.clearCache();
      resetBootstrap();
      void bootstrap({ force: true }).catch((bootstrapError: unknown) => {
        console.error("Error bootstrapping app data", bootstrapError);
      });
      navigateTo({ path: "/", replace: true });
    }
    else {
      error.value = response.message;
      pending.value = false;
    }
  }
  catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message;
    }
    else {
      error.value = String(e);
    }
    pending.value = false;
  }
};
</script>

<template>
  <page>
    <div class="mx-auto w-full max-w-md">
      <Typography variant="h1" size="heading-lg">Fluro Sheet Music</Typography>
      <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Sign in with your Fluro account to load your services and songs.
      </p>

      <Card class="mt-6">
        <template #content>
          <form class="flex flex-col gap-4" @submit.prevent="useLogin">
            <FloatLabel variant="in">
              <InputText
                id="username"
                v-model="username"
                :disabled="pending"
                size="large"
                name="username"
                type="text"
                autocomplete="username"
              />
              <label for="username">Username</label>
            </FloatLabel>
            <FloatLabel variant="in">
              <Password
                id="password"
                v-model="password"
                :disabled="pending"
                size="large"
                name="password"
                autocomplete="current-password"
              />
              <label for="password">Password</label>
            </FloatLabel>
            <Message v-if="error" severity="error" icon="times-circle">
              {{ error }}
            </Message>
            <Button
              :disabled="pending"
              size="large"
              type="submit"
              class="w-full"
              :label="pending ? 'Signing in...' : 'Sign in'"
            />
          </form>
        </template>
      </Card>
    </div>

    <AbsoluteFooter>
      Made with ❤️ by <a href="https://bevankay.me" target="_blank">Bevan Kay</a>
    </AbsoluteFooter>
  </page>
</template>
