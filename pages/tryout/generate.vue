<script setup lang="ts">
    import {
        ref,
        reactive,
        onMounted
    } from 'vue'
    import { useRouter } from 'vue-router'
    import { authFetch } from '../../composables/useAuth'
    import moment from 'moment'
    import $ from 'jquery'
    import Datepicker from '@vuepic/vue-datepicker'
    import '@vuepic/vue-datepicker/dist/main.css'
    import Swal from 'sweetalert2'

    definePageMeta({
        middleware: ['auth']
    })
    const router = useRouter()
    let table = ref(null)
    const formTryout = ref(null)
    let method = ref('')
    let disabled = ref(false)
    let dialog = ref(false)
    let valid = ref(true)
    let snackbar = ref(false)
    let snackbarText = ref('')
    let typeGenerate = ref('')
    let itemPaket = ref(null)
    let itemNilaiPaket = ref(null)
    let dataPaket = ref([])
    let itemTryout = ref(null)
    let itemNilaiTryout = ref(null)
    let dataTryout = ref([])
    let dataTryout2 = ref([])
    let loading = ref([])
    onMounted(() => {
        sessionStorage.path = '/tryout/generate'
        getPaket()
    })

    /* Methods */
    const getPaket = async () => {
        authFetch('/paket')
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                dataPaket.value = js.data
            });
    }

    const updatePaket = (value:any) => {
        if (value !== null) {
            authFetch('/paket/paket_tryout_generate/'+value)
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                dataTryout.value = js.data
            });
        }
    }


    const updateNilaiPaket = (value:any) => {
        if (value !== null) {
            authFetch('/paket/paket_tryout_generate/'+value)
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                dataTryout2.value = js.data
            });
        }
    }

    /* Methods */
    const submitForm = async (i_disabled:number) => {
        loading.value[i_disabled] = true
        if (itemTryout.value === null) {
            Swal.fire("Proses gagal!", `Tryout belum dipilih.`, "error")
            loading.value[i_disabled] = false
            return false
        }

        if (itemPaket.value === null) {
            Swal.fire("Proses gagal!", `Paket belum dipilih.`, "error")
            loading.value[i_disabled] = false
            return false
        }

        const payloadData = {
            tryout_code: itemTryout.value,
            paket_code: itemPaket.value
        }

        let urlSubmit = "/tryout/generate/add"
        if (typeGenerate.value === 'delete') urlSubmit = "/tryout/generate/delete"
        let data = Object.keys(payloadData).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(payloadData[key])).join("&")

        authFetch(urlSubmit, {
            method: 'POST',
            body: data,
        })
        .then((res) => {
            if (res.status === 201) {
            } else if (res.status === 400) {
            } else if (res.status >= 500) {
                Swal.fire("Proses gagal!", `Timeout gateway.`, "error")
            }
            return res.json()
            })
        .then((js) => {
            loading.value[i_disabled] = false
            let errors = []
            if (!js.success) {
                if (js.error_code === 'exist') {
                    Swal.fire({
                        html: js.message,
                        showCancelButton: true,
                        confirmButtonText: `Ya`,
                        cancelButtonText: "Batal",
                    }).then((result) => {
                        if (result.isConfirmed) {
                            typeGenerate.value = 'delete'
                            submitForm(1)
                        } else {
                            typeGenerate.value = ''
                            return false
                        }
                    });
                } else {
                    Swal.fire("Proses gagal!", js.message, "error")
                }

                for (var key in js.details) {
                    if (js.details.hasOwnProperty(key)) {
                        console.log(errors.push(js.details[key]))
                    }
                }

                return
            }

            typeGenerate.value = ''
            snackbarText.value = js.message
            snackbar.value = true
            getPaket()
        })
    }

    const submitFormNilai = async (i_disabled:number) => {
        loading.value[i_disabled] = true
        if (itemNilaiTryout.value === null) {
            Swal.fire("Proses gagal!", `Tryout belum dipilih.`, "error")
            loading.value[i_disabled] = false
            return false
        }

        if (itemNilaiPaket.value === null) {
            Swal.fire("Proses gagal!", `Paket belum dipilih.`, "error")
            loading.value[i_disabled] = false
            return false
        }

        const payloadData = {
            paket_code: itemNilaiPaket.value
        }

        let data = Object.keys(payloadData).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(payloadData[key])).join("&")

        let urlSubmit = `/tryout/generate-nilai/${itemNilaiTryout.value}/akbar?` + data

        authFetch(urlSubmit)
        .then((res) => {
            if (res.status === 201) {
            } else if (res.status === 400) {
            } else if (res.status >= 500) {
                Swal.fire("Proses gagal!", `Timeout gateway.`, "error")
            }
            return res.json()
            })
        .then((js) => {
            loading.value[i_disabled] = false
            let errors = []
            if (!js.success) {
                for (var key in js.details) {
                    if (js.details.hasOwnProperty(key)) {
                        console.log(errors.push(js.details[key]))
                    }
                }

                return
            }

            snackbarText.value = js.message
            snackbar.value = true
            getPaket()
        })
    }

</script>
<template>
    <v-card class="mx-auto">
        <v-snackbar
            v-model="snackbar"
            >
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
        <v-row>
        <v-col>
            <v-card-item>
                <v-card-title class="text-h4" style="line-height: 3rem;">Generate Soal Tryout Akbar</v-card-title>
            </v-card-item>    
        </v-col>
        <v-col>
            <v-card-actions>
            </v-card-actions>
        </v-col>
        </v-row>
        <v-card-text class="py-0">
            <v-col cols="12">
                <v-autocomplete
                    variant="solo"
                    v-model="itemPaket"
                    :items="dataPaket"
                    color="blue-grey-lighten-2"
                    item-title="name"
                    item-value="code"
                    label="Paket"
                    @update:modelValue="updatePaket"
                    clearable>
                    <template v-slot:item="{ props, item }">
                        <v-list-item
                            v-bind="props"
                            :title="item?.raw?.name"
                            :subtitle="`member duration: ${item?.raw?.membership_duration} ${item?.raw?.membership_duration_type} | kategori: ${item?.raw?.category}`"
                        ></v-list-item>
                    </template>
                </v-autocomplete>
            </v-col>

            <v-col cols="12">
                <v-autocomplete
                    variant="solo"
                    v-model="itemTryout"
                    :items="dataTryout"
                    color="blue-grey-lighten-2"
                    item-title="name"
                    item-value="tryout_code"
                    label="Tryout"
                    clearable>
                    <template v-slot:item="{ props, item }">
                        <v-list-item
                            v-bind="props"
                            :title="item?.raw?.name"
                            :subtitle="`kode: ${item?.raw?.tryout_code} |  durasi: ${item?.raw?.duration} menit | periode: ${item?.raw?.start_at} - ${item?.raw?.finish_at}`"
                        ></v-list-item>
                    </template>
                </v-autocomplete>
            </v-col>
        </v-card-text>
        <v-card-actions>
            <v-btn class="text-white" color="#5C9527" variant="flat" @click="submitForm(1)" :disabled="loading[1]" :loading="loading[1]"> Generate </v-btn>
        </v-card-actions>
    </v-card>

    <v-card class="mx-auto mt-10">
        <v-row>
            <v-col>
        <v-card-item>
            <v-card-title class="text-h4" style="line-height: 3rem;">Generate Nilai Tryout Akbar</v-card-title>
        </v-card-item>
        </v-col>
        <v-col>
            <v-card-actions>
            </v-card-actions>
        </v-col>
        </v-row>
        <v-card-text class="py-0">
            <v-col cols="12">
                <v-autocomplete
                    variant="solo"
                    v-model="itemNilaiPaket"
                    :items="dataPaket"
                    color="blue-grey-lighten-2"
                    item-title="name"
                    item-value="code"
                    label="Paket"
                    @update:modelValue="updateNilaiPaket"
                    clearable>
                    <template v-slot:item="{ props, item }">
                        <v-list-item
                            v-bind="props"
                            :title="item?.raw?.name"
                            :subtitle="`member duration: ${item?.raw?.membership_duration} ${item?.raw?.membership_duration_type} | kategori: ${item?.raw?.category}`"
                        ></v-list-item>
                    </template>
                </v-autocomplete>
            </v-col>

            <v-col cols="12">
                <v-autocomplete
                    variant="solo"
                    v-model="itemNilaiTryout"
                    :items="dataTryout2"
                    color="blue-grey-lighten-2"
                    item-title="name"
                    item-value="tryout_code"
                    label="Tryout"
                    clearable>
                    <template v-slot:item="{ props, item }">
                        <v-list-item
                            v-bind="props"
                            :title="item?.raw?.name"
                            :subtitle="`kode: ${item?.raw?.tryout_code} |  durasi: ${item?.raw?.duration} menit | periode: ${item?.raw?.start_at} - ${item?.raw?.finish_at}`"
                        ></v-list-item>
                    </template>
                </v-autocomplete>
            </v-col>
        </v-card-text>
        <v-card-actions>
            <v-btn class="text-white" color="#5C9527" variant="flat" @click="submitFormNilai(2)" :disabled="loading[2]" :loading="loading[2]"> Generate </v-btn>
        </v-card-actions>
    </v-card>
</template>