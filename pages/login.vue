<script setup lang="ts">
import { useStorage, type RemovableRef } from "@vueuse/core";
import { login } from "@/utils/login";

const user: RemovableRef<User> = useStorage("_fluro_user", { token: "", refreshToken: "" });
const username: Ref<string> = ref<string>("");
const password: Ref<string> = ref<string>("");
const error: Ref<string> = ref("");
const pending: Ref<boolean> = ref(false);

onBeforeMount(() => {
  if (isAuthenticated()) {
    navigateTo({ path: "/", replace: true });
  }
});

const useLogin = async (): Promise<void> => {
  pending.value = true;

  try {
    const response = await login(username.value, password.value);
    if (response.token) {
      user.value = response;

      songStore.clearCache();
      sheetStore.clearCache();
      await songStore.getSongs();
      await sheetStore.getSheets();
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
  <page class="pt-12">
    <Typography variant="h1" size="heading-lg">Welcome to Fluro Sheet Music Viewer</Typography>
    <Card class="w-fit p-4 mt-6">
      <template #title>
        <typography variant="h2" size="heading-md">
          Please login to continue
        </typography>
        <typography variant="p" size="text"><small>Login using your Fluro account details.</small></typography>
      </template>
      <template #content>
        <div class="flex flex-col gap-4">
          <FloatLabel variant="in">
            <InputText v-model="username" :disabled="pending" size="large" name="username" type="text" />
            <label for="username">Username</label>
          </FloatLabel>
          <FloatLabel variant="in">
            <Password v-model="password" :disabled="pending" size="large" name="password" :feedback="false" />
            <label for="password">Password</label>
          </FloatLabel>
          <Message v-if="error" severity="error" icon="pi pi-times-circle" class="mb-2">
            {{ error }}
          </Message>
          <div class="start">
            <Button
:disabled="pending" size="large" type="submit" :label="pending ? 'Attempting login...' : 'Login'"
              @click="useLogin" />
          </div>
        </div>
      </template>
    </Card>
    <AbsoluteFooter>
      Made with ❤️ by <a href="https://bevankay.me" target="_blank">Bevan Kay</a>
    </AbsoluteFooter>
  </page>
</template>
