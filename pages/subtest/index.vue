<script setup lang="ts">
    import {
        ref,
        reactive,
        onMounted
    } from 'vue'
    import { authFetch } from '../../composables/useAuth'
    import { useRouter } from 'vue-router'
    import moment from 'moment'
    import Swal from 'sweetalert2'
    import Datepicker from '@vuepic/vue-datepicker'
    import '@vuepic/vue-datepicker/dist/main.css'
    import CKEditor from '@ckeditor/ckeditor5-vue'
    import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

    definePageMeta({
        middleware: ['auth']
    })
    const router = useRouter()
    let table = ref(null)
    const tableRef = ref(null)
    const formSubtest = ref(null)
    let method = ref('')
    let disabled = ref(false)
    let dialog = ref(false)
    let loading = ref(false)
    let valid = ref(true)
    let snackbar = ref(false)
    let snackbarText = ref('')
    let i_kelas = ref('')
    let i_category = ref({})
    let curr_kelas = ref(null)
    let curr_category = ref(null)
    let formTitle = ref('')
    let formData = ref({})
    let ro_kode = ref(false)
    const kelas = []
    let arr_obj_kelas = ref([])
    const category = []
    let arr_obj_category = ref([])
    let rules = ref({
        categoryRules: [
            (v: any) => !!v || 'Subtest wajib diisi',
        ],
        durationRules: [
            (v: any) => !!v || 'Durasi wajib diisi',
            (v: any) => Number.isInteger(Number(v)) || "Durasi harus berupa angka",
        ],
        subtestKodeRules: [
            (v: any) => !!v || 'Kode Subtest wajib diisi',
        ],
        kelasRules: [
            (v: any) => !!v || 'Kelas wajib diisi',
        ]
    })
    onMounted(() => {
        sessionStorage.path = '/subtest'
        table = createTable(tableRef, {
            ajax: '/subtest',
            order : [
                [4, 'desc'],
            ],
            columns: [
                {
                    data: "subtest_code"
                },
                {
                    data: "category"
                },
                {
                    data: "kelas"
                },
                {
                    data: "duration"
                },
                {
                    data: "id",
                    sortable: false,
                    render: function (data, type, row, meta) {
                        // return !data ? '-' : moment(data).format("DD/MM/YYYY")
                        return `<div class="pa-2">
                            <button type="button" style="background-color:#E2F1FD;color:#2196F3" class="text-capitalize v-btn v-btn--elevated v-theme--light v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated detail-subtest-btn" data-code="${row.code}">
                                Soal (${row.count_soal ? row.count_soal : 0})
                            </button>
                        </div>`
                    }
                },
                {
                    data: "created_at",
                    visible:false
                },
            ],
            rowClick: function(evt)
            {
                console.log(evt)
            }
        })
        // this.$emit('ready')

        authFetch(`/banksoal/read_table_kelas`).then((res) => {
                return res.json()
        }).then((js) => {
            js.map(function(item){
                var a = {text: item.code+' - '+item.name, value:item.id}
                kelas.push(a)
            })
            kelas.map(function(obj){
                arr_obj_kelas.value.push(obj)
            })
        })

        authFetch(`/subtest/read_table_categorySubtest`).then((res) => {
            return res.json()
        }).then((js) => {
            js.map(function(item){
                var a = {text: item.name, value: {'id' : item.id , 'name' : item.name}}
                category.push(a)
            })
            category.map(function(obj){
                arr_obj_category.value.push(obj)
            })
        })
    })

    const closeModal = () => {
        dialog.value = false
        i_kelas.value = ''
        curr_kelas.value = {text: '', value:0}
        i_category.value = {}
        curr_category.value = {text: '', value:{}}
    }

    const save_kelas = (value:any) => {
        i_kelas.value = value
    }

    const save_category = (value:any) => {
        i_category.value = value
    }

    const handleClick = async (e:any) => {
        if (e.target.matches(".detail-subtest-btn")) {
            router.push({
                path : "/subtest/"+e.target.dataset.code
            })
        }
    }

    const reloadData = () => {
        table.ajax.reload()
    }

    const addData = () => {
        formTitle.value = 'Tambah Data Subtes'
        formData.value = {}
        method.value = 'POST'
        dialog.value = true
        disabled.value = false
        ro_kode.value = false
        // date.value = (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)
    }

    const editData = () => {
        formTitle.value = 'Edit Data Subtest'  
        method.value = 'PUT'
        var rows = table.rows('.selected').data()
        if(!rows[0]){
            snackbarText.value = 'Data belum dipilih.'
            snackbar.value = true
            return
        }
        curr_category.value = {text: rows[0].category, value:{'id' : rows[0].subtest_category_id, 'name' : rows[0].category}}
        curr_kelas.value = {text: rows[0].ckelas+' - '+rows[0].kelas, value:rows[0].kelas_id}
        i_category.value = {'id' : rows[0].subtest_category_id, 'name' : rows[0].category }
        i_kelas.value = rows[0].kelas_id
        ro_kode.value = true
        dialog.value = true
        disabled.value = false
        formData.value = rows[0]
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
          text: 'Hapus Data '+rows[0].subtest_code,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Oke',
          cancelButtonText: 'Batal',
        }).then((result) => {
          if (result.isConfirmed) {
            let subtest = rows[0]
            authFetch("/subtest/" + subtest.uuid, {
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
        const formSubtestRef = formSubtest.value
        let status = await formSubtestRef.validate()

        const payloadData = {
            duration: formData.value.duration,
            title: i_category.value.name,
            subtest_category_id: i_category.value.id,
            code: formData.value.subtest_code,
            kelas_id : i_kelas.value
        }

        let data = Object.keys(payloadData).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(payloadData[key])).join("&")
        // console.log(formData.value)
        // return

        if (status.valid) {
            disabled.value = true
            loading.value = true
            let urlSubmit = "/subtest"
            if (method.value == "PUT") urlSubmit = "/subtest/" + formData.value.uuid

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
                i_kelas.value = ''
                curr_kelas.value = {text: '', value:0}
                i_category.value = {}
                curr_category.value = {text: '', value:{}}
            })
        }
    }

    const alertFn = async () => {
        // let daterange = await formData.dates
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
                <v-card-title class="text-h4" style="line-height: 3rem;">Data Subtes</v-card-title>
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
                        <th class="text-left">Kode Subtes</th>
                        <th class="text-left">Kategori Subtes</th>
                        <th class="text-left">Kelas</th>
                        <th class="text-left">Durasi (Menit)</th>
                        <th class="text-left">Pengaturan</th>
                        <th class="text-left">Created at</th>
                    </tr>
                </thead>
                <tbody @click="handleClick">
                </tbody>
            </datatable>
        </v-card-text>
        <v-row justify="center">
        <v-dialog v-model="dialog" persistent max-width="450px">
            <v-card>
                <v-form ref="formSubtest" v-model="valid" lazy-validation>
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
                                <v-text-field label="Kode Subtes" :rules="rules.subtestKodeRules" v-model="formData.subtest_code" :readonly="ro_kode" required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-select v-model="curr_category" :rules="rules.categoryRules" :items="arr_obj_category" item-value="value" item-title="text" @update:modelValue="save_category" label="Kategori Subtes" outlined ></v-select>
                            </v-col>
                            <v-col cols="12">
                                <v-select v-model="curr_kelas" :rules="rules.kelasRules" :items="arr_obj_kelas" item-value="value" item-title="text" @update:modelValue="save_kelas" label="Kelas" outlined ></v-select>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model="formData.duration" :rules="rules.durationRules" label="Durasi (Menit)" type="number" clearable required></v-text-field>
                            </v-col>
                        </v-row>
                    </v-container>
                    </v-card-text>
                    <div class="px-10 pb-5 text-right">
                        <v-btn class="mr-5" variant="tonal" color="grey" text @click="closeModal"> Batal </v-btn>
                        <v-btn class="text-white" color="#5C9527"
                            :disabled="disabled"
                            prepend-icon="mdi-content-save"
                            :loading="loading" text @click="submitForm"> Simpan </v-btn>
                    </div>
                </v-form>
            </v-card>
        </v-dialog>
    </v-row>
    </v-card>
</template>