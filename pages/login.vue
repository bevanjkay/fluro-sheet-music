<script setup lang="ts">
import { useStorage } from "@vueuse/core";
import { login } from "@/utils/login"

const user = useStorage("_fluro_user", {});
const username = ref("");
const password = ref("");

const useLogin = async () => {
    try {
        const response = await login(username.value, password.value)
        user.value = response
        await navigateTo("/")
    } catch (error) {
        console.error(error)
    }
}
</script>

<template>
    <div>
        <input v-model="username" placeholder="Username" />
        <input v-model="password" type="password" />
        <button @click="useLogin">Login</button>
    </div>
</template>