<script setup lang="ts">
import { useStorage, type RemovableRef } from "@vueuse/core";
import { login } from "@/utils/login";

const user: RemovableRef<User> = useStorage("_fluro_user", { token: "", refreshToken: "" });
const username: Ref<string> = ref<string>("");
const password: Ref<string> = ref<string>("");
const error: Ref<string> = ref("");
const pending: Ref<boolean> = ref(false);

const useLogin = async (): Promise<void> => {
  pending.value = true;

  try {
    const response = await login(username.value, password.value);
    if (response.token) {
      user.value = response;
      navigateTo("/");
      reloadNuxtApp();
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
  <div class="page">
    <Card style="max-width: 60ch">
      <template #title>
        <h1 style="margin: 0;">
          Login
        </h1>
        <p>Login using your Fluro account.</p>
      </template>
      <template #content>
        <div class="grid row gap-1">
          <FloatLabel variant="in">
            <InputText
              v-model="username"
              :disabled="pending"
              size="large"
              name="username"
              type="text"
            />
            <label for="username">Username</label>
          </FloatLabel>
          <FloatLabel variant="in">
            <Password
              v-model="password"
              :disabled="pending"
              size="large"
              name="password"
              :feedback="false"
            />
            <label for="password">Password</label>
          </FloatLabel>
          <Message
            v-if="error"
            severity="error"
            icon="pi pi-times-circle"
            class="mb-2"
          >
            {{ error }}
          </Message>
          <div class="start">
            <Button
              :disabled="pending"
              size="large"
              type="submit"
              :label="pending ? 'Attempting login...' : 'Login'"
              @click="useLogin"
            />
          </div>
        </div>
      </template>
    </Card>
    <Message class="footer" severity="secondary">Made with ❤️ by <a href="https://bevankay.me" target="_blank">Bevan Kay</a></Message>
  </div>
</template>
