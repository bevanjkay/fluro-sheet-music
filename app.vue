<script lang="ts" setup>
import { useStorage } from '@vueuse/core'
import { getUserSession, refresh } from './utils/login'
import GlobalDialog from '@/components/GlobalDialog.vue'

const user: Ref<User> = useStorage('_fluro_user', { token: '', refreshToken: '' })
const loading: Ref<boolean> = ref(true)

onBeforeMount(async () => {
  if (!user.value) return
  try {
    const response = await getUserSession(user.value)
    console.log(response)
  }
  catch {
    try {
      console.log('Refreshing token', user.value.refreshToken)
      const response = await refresh(user.value.refreshToken)
      user.value.token = response.token
    }
    catch {
      user.value = {
        token: '',
        refreshToken: '',
      }
    }
  }
})

const songStore = useSongStore()
const sheetStore = useSheetStore()

onMounted(async () => {
  if (user.value) {
    await songStore.getSongs()
    await sheetStore.getSheets()
  }

  loading.value = false
})

const items = ref([
  {
    label: 'Home',
    icon: 'pi pi-fw pi-home',
    command: () => {
      navigateTo('/')
    },
  },
  {
    label: 'Service Plans',
    icon: 'pi pi-fw pi-calendar',
    command: () => {
      navigateTo('/plans')
    },
  },
  {
    label: 'Songs',
    icon: 'pi pi-fw pi-list',
    command: () => {
      navigateTo('/songs')
    },
  },
  {
    label: 'Custom Setlists',
    icon: 'pi pi-fw pi-th-large',
    command: () => {
      navigateTo('/custom')
    },
  },
  {
    label: 'Settings',
    icon: 'pi pi-fw pi-cog',
    command: () => {
      dialog.open(GlobalDialog, {})
    },
  },
])

const dialog = useDialog()

const logout = () => {
  user.value = {
    token: '',
    refreshToken: '',
  }
  navigateTo('/login')
}
</script>

<template>
  <div>
    <DynamicDialog />
    <Menubar :model="items">
      <template #end>
        <div class="flex">
          <Button @click="logout">
            Logout
          </Button>
        </div>
      </template>
    </Menubar>
    <div
      v-if="loading"
      style="padding:25px;"
    >
      <h2>Loading data...</h2>
      <ProgressSpinner />
    </div>
    <NuxtPage
      v-if="!loading"
      style="background: #f7f9fb;"
    />
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
