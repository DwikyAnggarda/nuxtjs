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
    import { authFetch } from '../../composables/useAuth'
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
    let dataSubtest:any[] = ref(null)
    let dataTryout = ref({})
    let selected = ref([])
    onMounted(() => {
        sessionStorage.path = '/tryout/detail'
        getTryoutByCode()
        table = createTable(tableRef, {
            ajax: '/tryout/subtest_tryout/'+route.params.code,
            columns: [
                {
                    data: "title"
                },
                {
                    data: "subtest_code"
                },
                {
                    data: "question_count",
                    render: function (data, type, row, meta) {
                        return !data ? 0 : data
                    }
                },
                {
                    data: "duration"
                },
            ],
            rowClick: function(evt)
            {
                console.log(evt)
            }
        })
    })

    /* Methods */
    const handleClick = async (e:any) => {
    }

    const getTryoutByCode = async () => {
            authFetch('/tryout/detail/'+route.params.code)
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                dataTryout.value = js.details

                if (dataTryout.value.start_at !== null) {
                    dataTryout.value.start_at = moment(dataTryout.value.start_at).format('DD/MM/YYYY')
                    dataTryout.value.finish_at = moment(dataTryout.value.finish_at).format('DD/MM/YYYY')
                } else {
                    dataTryout.value.start_at = '-'
                    dataTryout.value.finish_at = '-'
                }
            });
    }

    const getSubtestTryout = async () => {
            authFetch('/tryout/subtest_tryout/'+route.params.code)
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                dataSubtest.value = js.data

                dataSubtest.value.map(function (val:any) {
                    if (val.active === 1) {
                        selected.value = [...selected.value, val.code]
                    }
                })
            });
    }

    const allDataSubtest = computed(() => {
        let subtests = dataSubtest.value
        // console.log('text form', subtests)
        // return

        if (!searchinG.value) return subtests
        let _search = searchinG.value.toString().toLowerCase()

        return subtests.filter( item => {
            let text = item.title.toString().toLowerCase()
            let text2 = !item.subtest_code ? '-' : item.subtest_code.toString().toLowerCase()
            let text3 = !item.kelas ? '-' : item.kelas.toString().toLowerCase()

            return text.indexOf(_search) > -1 || text2.indexOf(_search) > -1 || text3.indexOf(_search) > -1
        })
    })

    /* CRUD Methods */
    const reloadData = () => {
        table.ajax.reload()
        getSubtestTryout()
    }

    const addData = () => {
        formTitle.value = 'Tambah Subtes'
        method.value = 'POST'
        dialog.value = true
        disabled.value = false
        getSubtestTryout()

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
          text: 'Hapus Data?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Hapus',
        }).then((result) => {
          if (result.isConfirmed) {
            let subtestTryout = rows[0]
            authFetch("/tryout/subtest_tryout/" + subtestTryout.uuid + '/'+route.params.code, {
                method: "DELETE",
            })
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                table.ajax.reload()
                getSubtestTryout()
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
            snackbarText.value = 'Data subtest belum dipilih.'
            snackbar.value = true
            return
        } else {
            formData.value.items = JSON.stringify(selected.value)
            let data = Object.keys(formData.value).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(formData.value[key])).join("&")
            loading.value = true
            disabled.value = true
            let urlSubmit = "/tryout/subtest_tryout/" + route.params.code

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
                    for (var key in js.details) {
                        if (js.details.hasOwnProperty(key)) {
                            console.log(errors.push(js.details[key]))
                        }
                    }

                    return;
                }

                table.ajax.reload()
                getSubtestTryout()
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
                <v-col cols="6" sm="6" md="3">
                <v-card style="width: 100%;" outlined color="transparent">
                    <v-card-item>
                        <v-card-title>NAMA TRYOUT</v-card-title>

                        <v-card-subtitle>{{ dataTryout.name }}</v-card-subtitle>
                    </v-card-item>
                </v-card>
                </v-col>
                <v-col cols="6" sm="6" md="3">
                    <v-card style="width: 100%;" outlined color="transparent">
                        <v-card-item>
                            <v-card-title>TIPE TRYOUT</v-card-title>

                            <v-card-subtitle>{{ dataTryout.tryout_type }}</v-card-subtitle>
                        </v-card-item>
                    </v-card>
                </v-col>
                <v-col cols="6" sm="6" md="3">
                    <v-card style="width: 100%;" outlined color="transparent">
                        <v-card-item>
                            <v-card-title>KELAS</v-card-title>

                            <v-card-subtitle>{{ dataTryout.nama_kelas }}</v-card-subtitle>
                        </v-card-item>
                    </v-card>
                </v-col>
                <v-col cols="6" sm="6" md="3">
                    <v-card style="width: 100%;" outlined color="transparent">
                        <v-card-item>
                            <v-card-title>TANGGAL TRYOUT</v-card-title>

                            <v-card-subtitle>{{ dataTryout.start_at === '-' ? '-' : dataTryout.start_at + ' - ' + dataTryout.finish_at }}</v-card-subtitle>
                        </v-card-item>
                    </v-card>
                </v-col>
            </v-row>
            <datatable id="tableRef" density="compact" ref="tableRef" :filter="true">
                <thead>
                    <tr>
                        <th class="text-left">
                            SUBTES
                        </th>
                        <th class="text-left">
                            KODE
                        </th>
                        <th class="text-left">
                            JUMLAH SOAL
                        </th>
                        <th class="text-left">
                            DURASI (MENIT)
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
                                                label="Cari Subtes"
                                                prepend-inner-icon="mdi-magnify"
                                                single-line
                                            ></v-text-field>
                                        </v-toolbar>

                                        <v-list height="300px" class="scroll" lines="three">
                                                <v-list-item
                                                    v-for="(item, i) in allDataSubtest"
                                                    :key="i"
                                                    :disabled="loading"
                                                    >

                                                    <template v-slot:prepend="">
                                                        <v-list-item-action start>
                                                            <v-checkbox-btn v-model="selected" :value="item.code"></v-checkbox-btn>
                                                        </v-list-item-action>
                                                    </template>

                                                    <v-list-item-title> {{ item.title }} </v-list-item-title>

                                                    <v-list-item-subtitle>
                                                    Kode : {{ !item.subtest_code ? '-' : item.subtest_code }}
                                                    </v-list-item-subtitle>

                                                    <v-list-item-subtitle>
                                                    Kelas : {{ !item.kelas ? '-' : item.kelas }}
                                                    </v-list-item-subtitle>

                                                    <v-list-item-subtitle>
                                                    Jumlah Soal : {{ !item.jml_soal ? 0 : item.jml_soal }}
                                                    </v-list-item-subtitle>

                                                    <v-list-item-subtitle>
                                                    Durasi : {{ `${!item.duration ? 0 : item.duration} Menit` }}
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
                                    prepend-icon="mdi-content-save"
                                    @click="submitForm" 
                                    :disabled="disabled"
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