<script setup>
const userprofile = ref([
	{
		title: 'Profile',
    desc: 'Account Settings',
    url: '/profile'
	},
	{
		title: 'Bantuan',
		desc: '',
    url: '/help'
	},
])
const logout = () => userLogout()
const user = await useUser()
</script>

<template>
  <v-menu anchor="bottom end" origin="auto" min-width="300">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        class="pa-0 px-1"
        elevation="0"
        color="transparent"
        plain
        :ripple="false"
      >
        <v-avatar size="35">
          <img :src="user.avatar_url" width="35" alt="Julia">
        </v-avatar>
      </v-btn>
    </template>

    <v-list class="pa-6" elevation="10" rounded="lg">
      <v-list-item
        v-for="(item, i) in userprofile"
        :key="i"
        class="pa-3 mb-2"
        :value="item"
        :title="item.title"
        :subtitle="item.desc"
        :to="item.url"
        rounded="lg"
      />
      <v-btn
        block
        color="secondary"
        variant="tonal"
        class="mt-4 py-4"
        @click.prevent="logout"
      >
        Logout
      </v-btn>
    </v-list>
  </v-menu>
</template>
