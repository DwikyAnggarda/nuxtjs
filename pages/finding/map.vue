<script setup lang="ts">
    import {
        ref,
        reactive,
        onMounted,
        onBeforeMount
    } from 'vue'
    import { useRouter } from 'vue-router'
    import { authFetch } from '../../composables/useAuth'
    import moment from 'moment'
    import Swal from 'sweetalert2'
    import $ from 'jquery'
    import Datepicker from '@vuepic/vue-datepicker'
    import '@vuepic/vue-datepicker/dist/main.css'

    let zoom = ref(10)
    const allMarker = []

    definePageMeta({
        middleware: ['auth']
    })

    onBeforeMount(async () => {
        authFetch(`/finding/getAllMarkers`).then((res) => {
            return res.json()
        }).then((js) => {
            allMarker.value = js
        })  
    })

    onMounted( () => {
    })
    
</script>
<template>
    <v-card class="mx-auto">
        <v-row>
            <v-col>
        <v-card-item>
            <v-card-title class="text-h4" style="line-height: 3rem;">Peta</v-card-title>
        </v-card-item>
        </v-col>
        </v-row>
        <v-card-text class="py-0">
            <div style="height:100vh; width:100%">
                <LMap
                  ref="map"
                  :zoom="zoom"
                  :center="[-7.547888460846955, 112.22894556115561]"
                >
                    <LTileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors"
                    layer-type="base"
                    name="OpenStreetMap"
                    />
                    <template v-for="item in allMarker.value">
                        <LMarker :lat-lng="item"> </LMarker>
                    </template>
                </LMap>
            </div>
        </v-card-text>
    </v-card>
</template>