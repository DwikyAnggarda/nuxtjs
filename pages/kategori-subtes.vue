<script setup lang="ts">
    import {
        ref,
        reactive,
        onMounted
    } from 'vue'
    import { useRouter } from 'vue-router'
    import { authFetch } from '../composables/useAuth'
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
    const formSubtestCategory = ref(null)
    let method = ref('')
    let disabled = ref(false)
    let dialog = ref(false)
    let valid = ref(true)
    let snackbar = ref(false)
    let isActive = ref(false)
    let snackbarText = ref('')
    let formTitle = ref('')
    let formData = ref({})
    let status = ref(null)
    let statusId:any = ref(null)
    let filteredStatus = ref([
        { name: 'Aktif', id: 1 },
        { name: 'Tidak Aktif', id: 0 },
        { name: 'Semua', id: 2 }
    ])
    let rules = ref({
        nameRules: [
            (v: any) => !!v || 'Nama Kategori Subtes wajib diisi',
            // (v: any) => (v && v.length >= 3) || 'Nama Kategori Subtes minimal 3 karakter',
        ],
        codeRules: [
            (v: any) => !!v || 'Prefix wajib diisi',
            // (v: any) => (v && v.length >= 3) || 'Prefix minimal 3 karakter',
        ]
    })
    onMounted(() => {
        sessionStorage.path = '/kategori-subtest'
        table = createTable(tableRef, {
            ajax: '/subtest_category',
            filterBy: [0,4],
            order: [
                [0, 'desc']
            ],
            paramData: function (d:any) {
                d.status = statusId.value
                // if (!statusId.value) {
                // }
            },
            columns: [
                {
                    data: "id",
                    visible : false
                },
                {
                    data: "name"
                },
                {
                    data: "code"
                },
                {
                    data: "active",
                    render: function (data, type, row, meta) {
                        let textColor = ''
                        let bgColor = ''
                        let textMsg = ''
                        if (data > 0) {
                            textColor = 'green'
                            bgColor = '#D8EED9'
                            textMsg = 'Aktif'
                        } else {
                            textColor = 'red'
                            bgColor = '#FFEBEB'
                            textMsg = 'Tidak Aktif'
                        }
                        return `<div class="text-center pa-2">
                                <button type="button" style="width:50%;background-color:${bgColor};" class="text-capitalize v-btn v-btn--elevated v-theme--light text-${textColor} v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated detail-tryout-btn"><i class="mdi-checkbox-blank-circle mdi v-icon notranslate v-theme--light v-icon--size-x-small v-icon--start" aria-hidden="true"></i>${textMsg}
                                </button>
                            </div>`
                    }
                }
            ],
            rowClick: function(evt)
            {
                console.log(evt)
            }
        })
        // this.$emit('ready')
    })

    /* Methods */
    const handleClick = async (e:any) => {
    }

    const onChangedStatus = (val:any) => {
        statusId.value = status.value.id
        reloadData()
    }

    /* CRUD Methods */
    const reloadData = () => {
        table.ajax.reload()
    }

    const addData = () => {
        formTitle.value = 'Tambah Data Kategori Subtes'
        formData.value = {}
        method.value = 'POST'
        dialog.value = true
        disabled.value = false
    }

    const editData = () => {
        formTitle.value = 'Edit Data Kategori Subtes'  
        method.value = 'PUT'
        var rows = table.rows('.selected').data()
        
        if(!rows[0]){
            snackbarText.value = 'Data belum dipilih.'
            snackbar.value = true
            return
        }

        dialog.value = true
        disabled.value = false
        formData.value = rows[0]
        isActive.value = rows[0].active === 1 ? true : false
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
            let subtest_category = rows[0]
            authFetch("/subtest_category/" + subtest_category.id, {
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
        const formSubtestCategoryRef = formSubtestCategory.value
        let status = await formSubtestCategoryRef.validate()

        const payloadData = {
            name: formData.value.name,
            code: formData.value.code,
            active: isActive.value !== false ? 1 : 0
        }

        let data = Object.keys(payloadData).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(payloadData[key])).join("&")

        if (status.valid) {
            disabled.value = true
            let urlSubmit = "/subtest_category"
            if (method.value == "PUT") urlSubmit = "/subtest_category/" + formData.value.id

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
                let errors = []
                if (!js.success) {
                    for (var key in js.details) {
                        if (js.details.hasOwnProperty(key)) {
                            console.log(errors.push(js.details[key]))
                        }
                    }

                    return
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
                <v-card-title class="text-h4" style="line-height: 3rem;">Data Kategori Subtes</v-card-title>
            </v-card-item>
        </v-col>
        <v-col>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn size="small" @click="reloadData" color="surface-variant" variant="text" icon="mdi-refresh"></v-btn>
                <v-btn size="small" @click="addData" color="surface-variant" variant="text" icon="mdi-plus"></v-btn>
                <v-btn size="small" @click="editData" color="surface-variant" variant="text" icon="mdi-pencil"></v-btn>
                <v-btn size="small" @click="deleteData" color="surface-variant" variant="text" icon="mdi-delete"></v-btn>
            </v-card-actions>
        </v-col>
        </v-row>
        <v-card-text class="py-0">
            <v-row>
                <v-col md="10" sm="6">
                </v-col>
                <v-col md="2" sm="6">
                    <v-select
                        v-model="status"
                        :items="filteredStatus"
                        @update:modelValue="onChangedStatus"
                        item-title="name"
                        item-value="id"
                        label="Status"
                        variant="solo"
                        return-object
                        single-line
                    ></v-select>
                </v-col>
            </v-row>
            <datatable density="compact" ref="tableRef" :filter="true">
                <thead>
                    <tr>
                        <th class="text-left">
                            Id
                        </th>
                        <th class="text-left">
                            Nama Kategori Subtes
                        </th>
                        <th class="text-left">
                            Kode Kategori Subtes
                        </th>
                        <th class="text-left">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody @click="handleClick">
                </tbody>
            </datatable>
        </v-card-text>
        <v-row justify="center">
        <v-dialog v-model="dialog" persistent max-width="450px">
            <v-card>
                <v-form ref="formSubtestCategory" v-model="valid" lazy-validation>
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
                                <v-text-field label="Nama Kategori Subtes" v-model="formData.name" :rules="rules.nameRules" clearable required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field label="Kode Kategori Subtes" v-model="formData.code" :rules="rules.codeRules" clearable required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-checkbox
                                    v-model="isActive"
                                    label="Aktif">
                                </v-checkbox>
                            </v-col>
                        </v-row>
                    </v-container>
                    </v-card-text>
                    <div class="px-10 pb-5 text-right">
                        <v-btn class="mr-5" variant="tonal" color="grey" @click="dialog = false"> Batal </v-btn>
                        <v-btn class="text-white" color="#5C9527"
                            variant="flat"
                            :disabled="disabled"
                            prepend-icon="mdi-content-save"
                            :loading="disabled" text @click="submitForm"> Simpan </v-btn>
                    </div>
                </v-form>
            </v-card>
        </v-dialog>
    </v-row>
    </v-card>
</template>