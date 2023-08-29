<script setup lang="ts">
import {
    ref,
    onMounted
} from 'vue'
import { authFetch } from '../../composables/useAuth'
import { useRoute } from 'vue-router'

const route = useRoute();
let snackbar = ref(false)
let snackbarText = ref('')
let alert = ref(false)
let alertText = ref('')
let alertType = ref('')

/* Activate user */
authFetch("/activate/" + route.params.code)
.then((res) => {
    return res.json()
})
.then((js) => {
    alert.value = true
    alertText.value = js.message
    alertType.value = js.success ? 'success' : 'error'
});
definePageMeta({
	layout: 'blank'
})
</script>
<template>
    <v-card class="mx-auto">
        <v-alert class="mt-5" :type="alertType" variant="elevated" closable close-label="Close Alert" v-if="alert"> {{ alertText }} </v-alert>
        <v-snackbar v-model="snackbar" v-if="false">
            {{ snackbarText }}

            <template v-slot:actions>
                <v-btn
                variant="text"
                @click="snackbar = false"
                >
                Close
                </v-btn>
            </template>
        </v-snackbar>
        Ini halaman activasi.
    </v-card>
</template>