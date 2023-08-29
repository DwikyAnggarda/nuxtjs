<style>
    
</style>
<script setup lang="ts">
    import {
        ref,
        onMounted
    } from 'vue'
    import { authFetch,useUser } from '../../composables/useAuth'
    import { vueRoute } from 'vue-route'
    import { vueRouter } from 'vue-router'
    import Swal from 'sweetalert2'
    
    definePageMeta({
        middleware: ['auth']
    })

    const user = await useUser()
    const route = useRoute()
    const router = useRouter()
    const formFinding = ref(null)
    let isSuperUser = ref(false)
    let method = ref('')
    let valid = ref(true)
    let lock = ref(false)
    let loading = ref(false)
    let disabled = ref(false)
    let dialog = ref(false)
    let snackbar = ref(false)
    let snackbarText = ref('')
    let formData = ref({})
    const centerMap = ref([-7.547888460846955, 112.22894556115561])
    const showMarker = ref(false)
    const markerPosition = ref([0,0])

    let rules = ref({
        fileRules: [
            (value: any) => value[0].size < 1000000 || 'Images size should be less than 1 MB!'
        ]
    })

    onMounted(() => {
         if(route.params.code != 'tambah') {
                console.log(user)
            if(user.role == 'superuser') {
                isSuperUser.value = true
            }
            method.value = 'PUT'
            authFetch(`/finding/getDetailFinding/`+route.params.code).then((res) => {
                return res.json()
            }).then((js) => {
                formData.value = js
                centerMap.value = [js.latitude,js.longitude]
                markerPosition.value = [js.latitude,js.longitude]
                showMarker.value = true
            })
        }
        else {
            method.value = 'POST'
        }

        const initData = () => {

        }
    })

    // Click map function
    const addMarker = (val:any) => {
        markerPosition.value = [parseFloat(val.latlng.lat), parseFloat(val.latlng.lng)]
        showMarker.value = true
        formData.value.latitude = val.latlng.lat
        formData.value.longitude = val.latlng.lng
    }

    const changeMarker = () => {

    }

    // Back to List
    const back = () => {
        router.push({
            path : "/finding"
        })
    }

    // Submit Data
    const submitForm = async () => {
        const formFindingRef = formFinding.value
        let status = await formFindingRef.validate()

        let data = Object.keys(formData.value).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(formData.value[key])).join("&")

        if (status.valid) {
            disabled.value = true
            loading.value = true
            let urlSubmit = "/finding"
            if (method.value == "PUT") urlSubmit = "/finding/" + formData.value.id

            authFetch(urlSubmit, {
                method: method.value,
                body: data,
            })
            .then((res) => {
                if (res.status === 201) {
                } else if (res.status === 400) {
                }
                return res.json()
                })
            .then((js) => {
                loading.value = false
                disabled.value = false
                let errors = []
                if (!js.success) {
                    // console.log(js.details)
                    for (var key in js.details) {
                        if (js.details.hasOwnProperty(key)) {
                            console.log(errors.push(js.details[key]))
                        }
                    }

                    return;
                }
                snackbarText.value = js.message
                snackbar.value = true
                router.push({
                    path : "/finding"
                })
            })
        }
    }

    // Verification Data
    const verificationData = () => {
        Swal.fire({
            title: 'Verfikasi Laporan.',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Setuju',
            denyButtonText: `Tolak`,
        }).then((result) => {
            let data = {
                id: route.params.code,
                action: ''
            }
            if (result.isConfirmed) {
                data.action = 'approve';
            } else if (result.isDenied) {
                data.action = 'reject';
            }
            else return;
            authFetch('/finding/verification', {
                method: 'POST',
                body: JSON.stringify(data),
            })
            .then((res) => {
                if (res.status === 201) {
                } else if (res.status === 400) {
                }
                return res.json()
                })
            .then((js) => {
                console.log(js)
                if(js.code_status == 1) {
                    Swal.fire({
                        title : 'Laporan Telah di Setujui!',
                        icon : 'success',
                    }).then((ok) => {
                        if (ok.isConfirmed) {
                            router.push({
                                path : "/finding"
                            })    
                        }
                    })
                } else if (js.code_status == 2) {
                    Swal.fire({
                        title : 'Laporan Telah di Tolak!',
                        icon : 'error',
                    }).then((ok) => {
                        if (ok.isConfirmed) {
                            router.push({
                                path : "/finding"
                            })    
                        }
                    })
                } else {
                    Swal.fire({
                        title : js.message,
                        icon : 'error',
                    }).then((ok) => {
                        if (ok.isConfirmed) {
                            // router.push({
                            //     path : "/finding"
                            // })    
                        }
                    })
                }
            })
        })         
    }
</script>
<template>
    <v-card class="mx-auto">
        <v-card-title>
            Form Laporan
        </v-card-title>
        <v-card-text >
            <v-form ref="formFinding" v-model="valid">
                <v-container>
                    <v-row>
                        <v-col cols="6">
                            <v-text-field v-model="formData.id" v-if="false" label="ID"></v-text-field>
                            <v-text-field v-model="formData.title" label="Nama Laporan"></v-text-field>
                            <v-textarea v-model="formData.note" label="Keterangan Laporan"></v-textarea>
                            <v-row>
                                <v-col cols="6">
                                    <v-text-field @input="changeMarker" v-model="formData.latitude" label="Latitude"></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field @input="changeMarker" v-model="formData.longitude" label="Longitude"></v-text-field>
                                </v-col>
                            </v-row>
                            
                        </v-col>
                        <v-col cols="6">
                            <div style="height:50vh; width:100%">
                                <LMap
                                  ref="map"
                                  :zoom="10"
                                  :center="centerMap"
                                  @click="addMarker"
                                >
                                  <LTileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors"
                                    layer-type="base"
                                    name="OpenStreetMap"
                                  />
                                   <LMarker v-if="showMarker" :lat-lng="markerPosition"> </LMarker>
                                </LMap>
                            </div>  
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-btn class="mr-2" @click="back" depressed variant="tonal" color="grey">Kembali</v-btn>
                            <v-btn @click="submitForm" depressed class="mr-2 text-white" color="#5C9527" :loading="loading" :disabled="disabled">Simpan</v-btn>
                            <v-btn @click="verificationData" v-if="isSuperUser" depressed class="text-white" color="#5C9527">Verifikasi Data</v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-form>
        </v-card-text>
    </v-card>
</template>