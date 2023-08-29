<script setup lang="ts">
    import {
        ref,
        reactive,
        onMounted
    } from 'vue'
    import { useRouter } from 'vue-router'
    import { authFetch } from '../../composables/useAuth'
    import moment from 'moment'
    import Swal from 'sweetalert2'
    import $ from 'jquery'
    import Datepicker from '@vuepic/vue-datepicker'
    import '@vuepic/vue-datepicker/dist/main.css'

    definePageMeta({
        middleware: ['auth']
    })
    const router = useRouter()
    let table = ref(null)
    const tableRef = ref(null)
    const formTryout = ref(null)
    let method = ref('')
    let disabled = ref(false)
    let dialog = ref(false)
    let loading = ref(false)
    let valid = ref(true)
    let snackbar = ref(false)
    let snackbarText = ref('')
    let formTitle = ref('')
    let formData = ref({})
    let dataKelas = ref([])
    let is_exist_code = ref(false)
    let rules = ref({
        nameRules: [
            (v: any) => !!v || 'Nama tryout wajib diisi',
            (v: any) => (v && v.length >= 3) || 'Nama tryout minimal 3 karakter',
        ],
        // titleRules: [
        //     (v: any) => !!v || 'Judul wajib diisi',
        //     (v: any) => (v && v.length >= 3) || 'Judul minimal 3 karakter',
        // ],
        // durationRules: [
        //     (v: any) => !!v || 'Durasi wajib diisi',
        //     (v: any) => Number.isInteger(Number(v)) || "Durasi harus berupa angka",
        // ],
        startAtRules: [
            (v: any) => !!v || 'Tanggal mulai wajib diisi'
        ],
        finishAtRules: [
            (v: any) => !!v || 'Tanggal mulai wajib diisi'
        ]
    })
    let scoring_type_choice = ref([
            {code:0, text:'IRT'},
            {code:1, text:'Normal'},
        ])
    onMounted(() => {
        sessionStorage.path = '/tryout'
        const startDate = new Date()
        const endDate = new Date(new Date().setDate(startDate.getDate() + 7))
        formData.value.dates = [startDate, endDate]
        getKelas()

        table = createTable(tableRef, {
            ajax: '/tryout',
            filterBy: [1],
            order : [
                [8, 'desc'],
            ],
            columns: [
                {
                    data: "tryout_code",
                    render: function (data, type, row, meta) {
                        return !data ? '-' : data
                    }
                },
                {
                    data: "name"
                },
                {
                    data: "tryout_type"
                },
                {
                    data: "nama_kelas",
                    render: function (data, type, row, meta) {
                        return !data ? '-' : data
                    }
                },
                {
                    data: "durasi_to"
                },
                {
                    data: "start_at",
                    render: function (data, type, row, meta) {
                        return !data ? '-' : moment(data).format("DD/MM/YYYY HH:mm:ss")
                    }
                },
                {
                    data: "finish_at",
                    render: function (data, type, row, meta) {
                        return !data ? '-' : moment(data).format("DD/MM/YYYY HH:mm:ss")
                    }
                },
                {
                    data: "created_at",
                    sortable: false,
                    render: function (data, type, row, meta) {
                        // return !data ? '-' : moment(data).format("DD/MM/YYYY")
                        return `
                        <div class="pa-2">
                        <button type="button" style="background-color:#E2F1FD;color:#2196F3" class="text-capitalize v-btn v-btn--elevated v-theme--light v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated detail-tryout-btn" data-code="${row.code}">Subtes (${row.count_subtes ? row.count_subtes : 0})
                        </button>
                        </div>`
                    }
                },
                {
                    data:"created_at",
                    visible:false
                }
            ],
            rowClick: function(evt)
            {
                console.log(evt)
            },
        })
        // this.$emit('ready')
    })

    /* Methods */
    const handleClick = async (e:any) => {
        // console.log('target', e.target)
        if (e.target.matches(".detail-tryout-btn")) {
            router.push({
                path: "/tryout/" + e.target.dataset.code
            })
        }
    }

    const getKelas = async () => {
        authFetch('/kelas')
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                let data = js.data.filter((item:any) => {
                    return item.active === 1
                })

                for (let i = 0; i < data.length; i++){
                    dataKelas.value[i] = data[i].name
                }

                // console.log('data kelas', dataKelas.value)
            });
    }

    /* CRUD Methods */
    const reloadData = () => {
        table.ajax.reload()
    }

    const addData = () => {
        formTitle.value = 'Tambah Data Tryout'
        formData.value = {}
        method.value = 'POST'
        dialog.value = true
        disabled.value = false
        is_exist_code.value = false

        const startDate = new Date()
        const endDate = new Date(new Date().setDate(startDate.getDate() + 7))
        formData.value.dates = [startDate, endDate]
        // date.value = (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)
    }

    const editData = () => {
        formTitle.value = 'Edit Data Tryout'  
        method.value = 'PUT'
        var rows = table.rows('.selected').data()
        
        if(!rows[0]){
            snackbarText.value = 'Data belum dipilih.'
            snackbar.value = true
            return
        }

        dialog.value = true
        disabled.value = false
        is_exist_code.value = true
        formData.value = rows[0]

        if (rows[0].tryout_type === 'TO Akbar') {
            let startDate = moment(rows[0].start_at).format('YYYY-MM-DD HH:mm:ss')
            let endDate = moment(rows[0].finish_at).format('YYYY-MM-DD HH:mm:ss')
            formData.value.dates = [startDate, endDate]
        } else {
            const startDate = new Date()
            const endDate = new Date(new Date().setDate(startDate.getDate() + 7))
            formData.value.dates = [startDate, endDate]
        }
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
          text: 'Hapus Data '+rows[0].tryout_code,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Oke',
          cancelButtonText: 'Batal',
        }).then((result) => {
          if (result.isConfirmed) {
            let tryout = rows[0]
            authFetch("/tryout/" + tryout.uuid, {
                method: "DELETE",
            })
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                table.ajax.reload()
                snackbarText.value = js.message
                snackbar.value = true
            });
          }
        })

    }

    const submitForm = async () => {
        // console.log('datede');
        const formTryoutRef = formTryout.value
        let status = await formTryoutRef.validate()

        const payloadData = {
            name: formData.value.name,
            // duration: formData.value.duration,
            nama_kelas: formData.value.nama_kelas,
            tryout_type: formData.value.tryout_type
        }

        if (formData.value.tryout_type === 'TO Akbar') {
            formData.value.dates[0] = moment(formData.value.dates[0]).format('YYYY-MM-DD HH:mm:ss')
            formData.value.dates[1] = moment(formData.value.dates[1]).format('YYYY-MM-DD HH:mm:ss')
            payloadData.dates = formData.value.dates
        }

        let data = Object.keys(formData.value).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(formData.value[key])).join("&")

        if (status.valid) {
            disabled.value = true
            loading.value = true
            let urlSubmit = "/tryout"
            if (method.value == "PUT") urlSubmit = "/tryout/" + formData.value.uuid

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
                    // console.log(js.details)
                    for (var key in js.details) {
                        if (js.details.hasOwnProperty(key)) {
                            console.log(errors.push(js.details[key]))
                        }
                    }

                    return;
                }

                table.ajax.reload()
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
            <v-card-item>
                <v-card-title class="text-h4" style="line-height: 3rem;">Data Tryout</v-card-title>
            </v-card-item>
        </v-col>
        <v-col>
            <v-card-actions>
                <!-- <v-col cols="6"></v-col>
                <v-col cols="7">
                    <v-row>
                    </v-row>
                </v-col> -->
                <v-spacer></v-spacer>
                <v-btn size="small" @click="reloadData" color="surface-variant" variant="text" icon="mdi-refresh"></v-btn>
                <v-btn size="small" @click="addData" color="surface-variant" variant="text" icon="mdi-plus"></v-btn>
                <v-btn size="small" @click="editData" color="surface-variant" variant="text" icon="mdi-pencil"></v-btn>
                <v-btn size="small" @click="deleteData" color="surface-variant" variant="text" icon="mdi-delete"></v-btn>
            </v-card-actions>
        </v-col>
        </v-row>
        <v-card-text class="py-0">
            <datatable density="compact" ref="tableRef" :filter="true">
                <thead>
                    <tr>
                        <th class="text-left">
                            KODE TRYOUT
                        </th>
                        <th class="text-left">
                            NAMA TRYOUT
                        </th>
                        <th class="text-left">
                            TIPE TRYOUT
                        </th>
                        <th class="text-left">
                            KELAS
                        </th>
                        <th class="text-left">
                            DURASI (MENIT)
                        </th>
                        <th class="text-left">
                            TGL MULAI
                        </th>
                        <th class="text-left">
                            TGL SELESAI
                        </th>
                        <th class="text-left">
                            PENGATURAN
                        </th>
                        <th class="text-left">
                            Created at
                        </th>
                    </tr>
                </thead>
                <tbody @click="handleClick">
                </tbody>
            </datatable>
        </v-card-text>
        <v-row justify="center">
        <v-dialog v-model="dialog" persistent max-width="450px" :scrollable="true">
            <v-card>
                <v-form ref="formTryout" v-model="valid" lazy-validation>
                    <v-card-title>
                        <v-btn
                            @click="dialog = false"
                            icon="mdi-chevron-left"
                            size="small"
                            variant="text"
                        ></v-btn>
                        <span class="text-h5"> {{ formTitle }} </span>
                    </v-card-title>
                    <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field v-model="formData.tryout_code" label="Kode Tryout" :disabled="is_exist_code"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field label="Nama Tryout" v-model="formData.name" :rules="rules.nameRules" clearable required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-select clearable label="Tipe Tryout"
                                    :items="['TO Mandiri', 'TO Akbar']"
                                    v-model="formData.tryout_type"
                                    >
                                </v-select>
                            </v-col>
                            <!-- <v-col cols="6">
                                <v-text-field v-model="formData.duration" :rules="rules.durationRules" label="Durasi (Menit)" type="number" clearable required></v-text-field>
                            </v-col> -->
                            <v-col cols="12" v-if="formData.tryout_type == 'TO Akbar'">
                                <span>Periode</span>
                                <Datepicker v-model="formData.dates" placeholder="Periode" format="dd-MM-yyyy HH:mm:ss" :enable-time-picker="true" :is-24="true"  month-name-format="long" locale="id" enable-seconds range></Datepicker>
                            </v-col>
                            <v-col cols="12">
                                <v-select clearable label="Kelas"
                                    :items="dataKelas"
                                    v-model="formData.nama_kelas"
                                    >
                                </v-select>
                            </v-col>
                            <v-col cols="12">
                                <v-select clearable label="Tipe Penilaian"
                                    :items="scoring_type_choice"
                                    item-title="text"
                                    item-value="code"
                                    v-model="formData.scoring_type"
                                    >
                                </v-select>
                            </v-col>
                        </v-row>
                    </v-container>
                    </v-card-text>
                    <div class="px-10 pb-5 text-right">
                        <v-btn class="mr-5" variant="tonal" color="grey" text @click="dialog = false"> Batal </v-btn>
                        <v-btn 
                            class="text-white" color="#5C9527"
                            :disabled="disabled"
                            prepend-icon="mdi-content-save"
                            :loading="loading"
                            text @click="submitForm"> Simpan </v-btn>
                    </div>
                </v-form>
            </v-card>
        </v-dialog>
    </v-row>
    </v-card>
</template>
<!-- <style>
.v-form{
    overflow: scroll;
}
</style> -->