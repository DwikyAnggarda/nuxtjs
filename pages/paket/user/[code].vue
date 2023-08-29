<style type="text/css">
    .scroll {
       overflow-y: scroll
    }
</style>
<script setup lang="ts">
    import {
        ref,
        onMounted,
        computed
    } from 'vue'
    import { authFetch } from '../../../composables/useAuth'
    import { useRoute, useRouter } from 'vue-router'
    import moment from 'moment'
    import Swal from 'sweetalert2'

    definePageMeta({
        middleware: ['auth']
    })

    const route = useRoute();
    const router = useRouter();
    const formUser = ref(null)
    const tableRef = ref(null)
    const formTryout = ref(null)
    let snackbar = ref(false)
    let snackbarText = ref('')
    let loading = ref(false)
    let alert = ref(false)
    let alertText:any = ref('')
    let alertType = ref('')
    let table = ref(null)
    let method = ref('')
    let disabled = ref(false)
    let dialog = ref(false)
    let valid = ref(true)
    let isActive = ref(false)
    let formTitle = ref('')
    let searchinG = ref('')
    let formData = ref({})
    let dataPaket = ref({})
    let dataTryout:any[] = ref(null)
    let selected = ref([])
    onMounted(() => {
        sessionStorage.path = '/paket/user'
        table = createTable(tableRef, {
            ajax: '/paket/paket_user/'+route.params.code,
            columns: [
                {
                    data: "name"
                },
                {
                    data: "email"
                },
                {
                    data: "phone"
                },
                {
                    data: "school"
                }
            ],
            rowClick: function(evt)
            {
                console.log(evt)
            }
        })

        authFetch('/paket/detail_paket/'+route.params.code)
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                dataPaket.value = js[0]
                console.log('test',dataPaket.value)
            });
    })

    /* Methods */
    const handleClick = async (e:any) => {
    }

    const getPaketTryout = async () => {
            authFetch('/paket/paket_user/'+ route.params.code + `?datatable=false&type=ssc`)
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                console.log(js.data)
                dataTryout.value = js.data

                dataTryout.value.map(function (val:any) {
                    if (val.beli === 1) {
                        selected.value = [...selected.value, val.code]
                    }
                })
            });
    }

    const allDataTryout = computed(() => {
        let tryouts = dataTryout.value

        if (!searchinG.value) return tryouts
        let _search = searchinG.value.toString().toLowerCase()

        return tryouts.filter( item => {
            let text = item.name.toString().toLowerCase()

            return text.indexOf(_search) > -1
        })
    })

    /* CRUD Methods */
    const reloadData = () => {
        table.ajax.reload()
        getPaketTryout()
    }

    const addData = () => {
        formTitle.value = 'Tambah User'
        method.value = 'POST'
        dialog.value = true
        disabled.value = false
        getPaketTryout()

        selected.value = []
    }
    
    const deleteData = () => {
        var rows = table.rows('.selected').data()
        if(!rows[0]){
            snackbarText.value = 'Data belum dipilih.'
            snackbar.value = true
            return
        }

        Swal.fire({
          title: 'Konfirmasi Hapus?',
          text: 'Hapus Data '+rows[0].name,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Oke',
          cancelButtonText: 'Batal',
        }).then((result) => {
          if (result.isConfirmed) {
            let paketTryout = rows[0]
            console.log(paketTryout)
            authFetch("/paket/paket_user/" + paketTryout.id, {
                method: "DELETE",
            })
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                table.ajax.reload()
                getPaketTryout()
                snackbarText.value = js.message
                snackbar.value = true
            });
          }
        })

    }

    const submitForm = async () => {
        // console.log('result', selected.value)
        // return

        if (selected.value.length < 1) {
            snackbarText.value = 'Data tryout belum dipilih.'
            snackbar.value = true
            return
        } else {
            formData.value.items = JSON.stringify(selected.value)
            let data = Object.keys(formData.value).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(formData.value[key])).join("&")

            disabled.value = true
            loading.value = true
            let urlSubmit = "/paket/paket_user/" + route.params.code

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
                disabled.value = false
                loading.value = false
                let errors = []
                if (!js.success) {
                    for (var key in js.details) {
                        if (js.details.hasOwnProperty(key)) {
                            console.log(errors.push(js.details[key]))
                        }
                    }

                    return;
                }

                table.ajax.reload()
                getPaketTryout()
                dialog.value = false
                snackbarText.value = js.message
                snackbar.value = true
            })
        }
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
        <v-card-item title="Data User">
        </v-card-item>
        </v-col>
        <v-col>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn size="small" @click="reloadData" color="surface-variant" variant="text" icon="mdi-refresh"></v-btn>
                <v-btn size="small" @click="addData" color="surface-variant" variant="text" icon="mdi-plus"></v-btn>
                <v-btn size="small" @click="deleteData" color="surface-variant" variant="text" icon="mdi-delete"></v-btn>
            </v-card-actions>
        </v-col>
        </v-row>
        <v-card-text class="py-0">
            <v-row class="mb-3">
                <v-col cols="auto">
                <v-card width="200" outlined color="transparent">
                    <v-card-item>
                        <v-card-title>NAMA PAKET</v-card-title>

                        <v-card-subtitle>{{ dataPaket.name }}</v-card-subtitle>
                    </v-card-item>
                </v-card>
                </v-col>
                <v-col cols="auto">
                    <v-card width="200" outlined color="transparent">
                        <v-card-item>
                            <v-card-title>MASA AKTIF</v-card-title>

                            <v-card-subtitle>{{ dataPaket.membership_duration }} {{ dataPaket.membership_duration_type }}</v-card-subtitle>
                        </v-card-item>
                    </v-card>
                </v-col>
                <v-col cols="auto">
                    <v-card outlined color="transparent">
                        <v-card-item>
                            <v-card-title>HARGA</v-card-title>

                            <v-card-subtitle>Rp. {{ dataPaket.price }}</v-card-subtitle>
                        </v-card-item>
                    </v-card>
                </v-col>
            </v-row>
            <datatable id="tableRef" density="compact" ref="tableRef" :filter="true">
                <thead>
                    <tr>
                        <th class="text-left">
                            NAMA SISWA
                        </th>
                        <th class="text-left">
                            EMAIL
                        </th>
                        <th class="text-left">
                            NOMOR TELEPON
                        </th>
                        <th class="text-left">
                            ASAL SEKOLAH
                        </th>
                    </tr>
                </thead>
                <tbody @click="handleClick">
                </tbody>
            </datatable>
        </v-card-text>

        <v-row justify="center">
            <v-dialog v-model="dialog" persistent max-width="700" width="100%" scrollable>
                <v-card>
                    <v-form ref="formUser" v-model="valid" lazy-validation>
                            <v-card-title>
                                <v-btn
                                    @click="dialog = false"
                                    icon="mdi-chevron-left"
                                    size="small"
                                    variant="text"
                                ></v-btn>
                                <span class="text-h5">{{ formTitle }}</span>
                            </v-card-title>
                            <v-card-text>
                                <v-container>
                                    <v-card
                                        class="mx-auto"
                                        max-width="800"
                                    >
                                        <v-toolbar>
                                            <v-text-field
                                                v-model="searchinG"
                                                clearable
                                                hide-details
                                                label="Cari User"
                                                prepend-inner-icon="mdi-magnify"
                                                single-line
                                            ></v-text-field>
                                        </v-toolbar>

                                        <v-list height="300px" class="scroll" lines="three">
                                                <v-list-item
                                                    v-for="(item, i) in allDataTryout"
                                                    :key="i"
                                                    :disabled="loading"
                                                    >

                                                    <template v-slot:prepend="">
                                                        <v-list-item-action start>
                                                            <v-checkbox-btn v-model="selected" :value="item.code"></v-checkbox-btn>
                                                        </v-list-item-action>
                                                    </template>

                                                    <v-list-item-title> {{ item.name }} </v-list-item-title>

                                                    <v-list-item-subtitle>
                                                        Asal Sekolah : {{ item.school }}
                                                    </v-list-item-subtitle>

                                                    <v-list-item-subtitle>
                                                        Nomor Telepon : {{ item.phone }}
                                                    </v-list-item-subtitle>

                                                    <v-list-item-subtitle>
                                                        Email : {{ item.email }}
                                                    </v-list-item-subtitle>
                                                    <v-divider></v-divider>

                                                </v-list-item>
                                        </v-list>
                                    </v-card>
                                </v-container>
                            </v-card-text>
                            <div class="px-10 pb-5 text-right">
                                <v-btn
                                    variant="tonal" color="grey"
                                    @click="dialog = false"
                                    class="mr-5"
                                >
                                    Batal
                                </v-btn>
                                <v-btn
                                    class="text-white" color="#5C9527"
                                    @click="submitForm" 
                                    :disabled="disabled"
                                    prepend-icon="mdi-content-save"
                                    :loading="loading"
                                >
                                    Simpan
                                </v-btn>
                            </div>
                    </v-form>
                </v-card>
            </v-dialog>
        </v-row>
    </v-card>
</template>