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
    const formPengumuman = ref(null)
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
    let announcementType = ref(null)
    // let statusId:any = ref(null)
    // let filteredStatus = ref([
    //     { name: 'Aktif', id: 1 },
    //     { name: 'Tidak Aktif', id: 0 },
    //     { name: 'Semua', id: 2 }
    // ])
    let groupType = ref([
        { name: 'Promosi', status: 2 },
        { name: 'Pengumuman', status: 3 },
        { name: 'Peringatan', status: 4 },
        { name: 'Informasi', status: 5 }
    ])
    let rules = ref({
        titleRules: [
            (v: any) => !!v || 'Judul wajib diisi',
            (v: any) => (v && v.length >= 3) || 'Judul minimal 3 karakter',
        ],
        msgRules: [
            (v: any) => !!v || 'Pesan wajib diisi',
            (v: any) => (v && v.length >= 3) || 'Pesan minimal 3 karakter',
        ],
        codeRules: [
            (v: any) => !!v || 'Prefix wajib diisi',
            (v: any) => (v && v.length >= 3) || 'Prefix minimal 3 karakter',
        ]
    })
    onMounted(() => {
        sessionStorage.path = '/notif/announcement'
        table = createTable(tableRef, {
            ajax: '/notif/announcement',
            filterBy: [0,1],
            order: [[0, 'desc']],
            // paramData: function (d:any) {
            //     d.status = statusId.value
            //     // if (!statusId.value) {
            //     // }
            // },
            columns: [
                {
                    data: "title"
                },
                {
                    data: "message",
                    render: function (data, type, row, meta) {
                        return !data ? '-' : data
                    }
                },
                {
                    data: "type",
                    render: function (data, type, row, meta) {
                        let textColor = ''
                        let bgColor = ''
                        let msg = ''

                        if (data == 2) {
                            msg = 'Promosi'
                            textColor = '#4CAF50'
                            bgColor = '#D8EED9'
                        } else if (data == 3) {
                            msg = 'Pengumuman'
                            textColor = '#FB8C00'
                            bgColor = '#FFE6C7'
                        } else if (data == 4) {
                            msg = 'Peringatan'
                            textColor = '#FF5252'
                            bgColor = '#FFEBEB'
                        } else {
                            msg = 'Informasi'
                            textColor = '#2196F3'
                            bgColor = '#E2F1FD'
                        }

                        return `<div class="text-center pa-2">
                                <button type="button" style="width:65%;background-color:${bgColor}; color:${textColor}" class="text-capitalize v-btn v-btn--elevated v-theme--light v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated detail-tryout-btn"><i class="mdi-checkbox-blank-circle mdi v-icon notranslate v-theme--light v-icon--size-x-small v-icon--start" aria-hidden="true"></i>${msg}
                                </button>
                            </div>`
                    }
                },
                {
                    data: "active",
                    sortable: false,
                    render: function (data, type, row, meta) {
                        let textColor = ''
                        let bgColor = ''
                        let msg = ''
                        if (data === 1) {
                            msg = 'Aktif'
                            textColor = 'green'
                            bgColor = '#D8EED9'
                        } else {
                            msg = 'Tidak Aktif'
                            textColor = 'red'
                            bgColor = '#FFEBEB'
                        }

                        return `<div class="text-center pa-2">
                                <button type="button" style="width:65%;background-color:${bgColor};" class="text-capitalize v-btn v-btn--elevated v-theme--light text-${textColor} v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated detail-tryout-btn"><i class="mdi-checkbox-blank-circle mdi v-icon notranslate v-theme--light v-icon--size-x-small v-icon--start" aria-hidden="true"></i>${msg}
                                </button>
                            </div>`
                    }
                }
            ],
            rowClick: function(evt)
            {
                // console.log(evt)
            }
        })
        // this.$emit('ready')
    })

    /* Methods */
    const handleClick = async (e:any) => {
    }

    const setType = (val:any) => {
        // statusId.value = status.value.id
        // announcementType.value
    }

    /* CRUD Methods */
    const reloadData = () => {
        table.ajax.reload()
    }

    const addData = () => {
        formTitle.value = 'Buat Pengumuman'
        formData.value = {}
        method.value = 'POST'
        dialog.value = true
        disabled.value = false
    }

    const editData = () => {
        formTitle.value = 'Edit Pengumuman'
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
        announcementType.value = { name: rows[0].type == 2 ? 'Promosi' : rows[0].type == 3 ? 'Pengumuman' : rows[0].type == 4 ? 'Peringatan' : rows[0].type == 5 ? 'Informasi' : '', status: parseInt(rows[0].type) }
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
          text: 'Hapus Data '+rows[0].title,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Oke',
          cancelButtonText: 'Batal',
        }).then((result) => {
          if (result.isConfirmed) {
            let announcement = rows[0]
            authFetch("/notif/announcement/" + announcement.id, {
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
        const formPengumumanRef = formPengumuman.value
        let status = await formPengumumanRef.validate()

        const payloadData = {
            title: formData.value.title,
            message: formData.value.message,
            type: !announcementType.value ? null : announcementType.value.status,
            active: isActive.value !== false ? 1 : 0
        }

        let data = Object.keys(payloadData).map((key) => encodeURIComponent(key) + "=" + ((payloadData[key] === false || payloadData[key] === undefined) ? null : encodeURIComponent(payloadData[key]))).join("&")

        if (status.valid) {
            disabled.value = true
            let urlSubmit = "/notif/announcement"
            if (method.value == "PUT") urlSubmit = "/notif/announcement/" + formData.value.id

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
                <v-card-title class="text-h4" style="line-height: 3rem;">List Pengumuman</v-card-title>
            </v-card-item>
        </v-col>
        <v-col>
            <v-card-actions>
                <!-- <v-select
                    v-model="status"
                    :items="filteredStatus"
                    @update:modelValue="onChangedStatus"
                    item-title="name"
                    item-value="id"
                    label="Status"
                    return-object
                    single-line
                ></v-select> -->
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
                            Judul
                        </th>
                        <th class="text-left">
                            Pesan
                        </th>
                        <th class="text-left">
                            Tipe
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
                <v-form ref="formPengumuman" v-model="valid" lazy-validation>
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
                                <v-text-field label="Judul" v-model="formData.title" :rules="rules.titleRules" clearable required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-textarea clearable label="Pesan" variant="outlined" v-model="formData.message" :rules="rules.msgRules" rows="3" row-height="25"></v-textarea>
                            </v-col>
                            <v-col cols="12">
                                <v-select
                                    v-model="announcementType"
                                    :items="groupType"
                                    @update:modelValue="setType"
                                    item-title="name"
                                    item-value="status"
                                    label="Tipe"
                                    return-object
                                    single-line
                                ></v-select>
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