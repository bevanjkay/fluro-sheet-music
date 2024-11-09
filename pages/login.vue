<script setup lang="ts">
import { useStorage } from "@vueuse/core";
import { login } from "@/utils/login"

const user = useStorage("_fluro_user", {});
const username = ref<string>("");
const password = ref<string>("");
const error = ref("");
const pending = ref(false);

const useLogin = async () => {
    pending.value = true;

    try {
        const response = await login(username.value, password.value)
        if (response.token) {
            user.value = response;
            reloadNuxtApp()
        } else {
            error.value = response.message
            pending.value = false;
        }
    } catch (e) {
        error.value = e.message
        pending.value = false;
    }
}
</script>

<template>
    <div class="page">
        <Card style="max-width: 60ch">
            <template #title>
                <h1 style="margin: 0;">Login</h1>
                <p>Login using your Fluro account.</p>
            </template>
            <template #content>
                <div class="grid row gap-1">
                    <FloatLabel variant="in">
                        <InputText :disabled="pending" size="large" v-model="username" name="username" type="text" />
                        <label for="username">Username</label>
                    </FloatLabel>
                    <FloatLabel variant="in">
                        <Password :disabled="pending" size="large" v-model="password" name="password"
                            :feedback="false" />
                        <label for="password">Password</label>
                    </FloatLabel>
                    <Message v-if="error" severity="error" icon="pi pi-times-circle" class="mb-2">
                        {{ error }}
                    </Message>
                    <div class="start">
                        <Button :disabled="pending" size="large" @click="useLogin" type="submit"
                            :label="pending ? 'Attempting login...' : 'Login'" />
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>