<script setup lang="ts">
import {
	ref,
	onMounted
} from 'vue'
import {
	useDisplay
} from 'vuetify'
import Sidebar from '~~/components/layouts/admin/Sidebar.vue'
import Header from '~~/components/layouts/admin/Header.vue'
useHead({
	title: 'Rayyan Cendekia Utama'
})
const showHideSpinner = ref(true);
const drawer = ref(undefined || true)
const innerW = window.innerWidth
const {
	mdAndUp,
	mdAndDown
} = useDisplay()
onMounted(() => {
  showHideSpinner.value = false;
	if (innerW < 950) {
		drawer.value = !drawer.value
	}
})
const logout = () => userLogout()
</script>
<template>
  <div>
    <LoadSpinner v-if="showHideSpinner" />
    <v-app>
      <!-- ---------------------------------------------- -->
      <!---Header -->
      <!-- ---------------------------------------------- -->
      <v-app-bar class="px-4">
        <div class="pe-5">
          <NuxtLink to="/" class="d-flex">
            <!-- <img src="/images/logos/white-logo-icon.svg"> -->
            <img src="/images/logos/rcu.png" width="120" class="pl-3">
          </NuxtLink>
        </div>
        <v-app-bar-nav-icon class="" @click="drawer = !drawer" />
        <v-spacer />
        <!-- ---------------------------------------------- -->
        <!-- User Profile -->
        <!-- ---------------------------------------------- -->
        <template v-slot:append>
          <v-btn prepend-icon="mdi-logout" @click.prevent="logout">Logout</v-btn>
        </template>
        <!--<Header />-->
      </v-app-bar>
      <v-main style="background-color: #f2f2f2 !important;">
        <!-- ---------------------------------------------- -->
        <!---Sidebar -->
        <!-- ---------------------------------------------- -->
        <v-navigation-drawer
          style="background-color: #F6F8F9;"
          v-model="drawer"
          left
          :permanent="mdAndUp"
          elevation="10"
          app
          fixed
          :temporary="mdAndDown"
          expand-on-hover
        >
          <Sidebar />
        </v-navigation-drawer>
        <v-container fluid class="page-wrapper">
          <slot />
        </v-container>
      </v-main>
    </v-app>
  </div>
</template>
