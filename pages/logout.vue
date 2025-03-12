<script lang="ts" setup>
import { useStorage } from "@vueuse/core";
const user: Ref<User> = useStorage("_fluro_user", { token: "", refreshToken: "" });
const toast = useToast();

onMounted(() => {
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
});
</script>

<template>
    <PageWrapper class="pt-12">
        <TypographyWrapper variant="h1" size="heading-lg">Logging out...</TypographyWrapper>
    </PageWrapper>
</template>
