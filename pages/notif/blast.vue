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
    const formBlastNotif = ref(null)
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
    // let filteredStatus = ref([
    //     { name: 'Aktif', id: 1 },
    //     { name: 'Tidak Aktif', id: 0 },
    //     { name: 'Semua', id: 2 }
    // ])
    let rules = ref({
        titleRules: [
            (v: any) => !!v || 'Judul wajib diisi',
            (v: any) => (v && v.length >= 3) || 'Judul minimal 3 karakter',
        ],
        msgRules: [
            (v: any) => !!v || 'Pesan wajib diisi',
            (v: any) => (v && v.length >= 3) || 'Pesan minimal 3 karakter',
        ]
    })
    onMounted(() => {
        sessionStorage.path = '/notif/blast'
        table = createTable(tableRef, {
            ajax: '/notif/blast',
            filterBy: [1,2],
            // paramData: function (d:any) {
            //     d.status = statusId.value
            //     // if (!statusId.value) {
            //     // }
            // },
            columns: [
                {
                    data: "created_at"
                },
                {
                    data: "title"
                },
                {
                    data: "content"
                },
                {
                    data: "link",
                    render: function (data, type, row, meta) {
                        return !data ? '-' : data
                    }
                },
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

    // const onChangedStatus = (val:any) => {
    //     statusId.value = status.value.id
    //     reloadData()
    // }

    /* CRUD Methods */
    const reloadData = () => {
        table.ajax.reload()
    }

    const addData = () => {
        formTitle.value = 'Tambah Blast Notif'
        formData.value = {}
        method.value = 'POST'
        dialog.value = true
        disabled.value = false
    }

    const editData = () => {
        formTitle.value = 'Edit Blast Notif'
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
          text: 'Hapus Data '+rows[0].title,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Oke',
          cancelButtonText: 'Batal',
        }).then((result) => {
          if (result.isConfirmed) {
            // let passing_grade = rows[0]
            // authFetch("/passing_grade/" + passing_grade.id, {
            //     method: "DELETE",
            // })
            // .then((res) => {
            //     return res.json()
            // })
            // .then((js) => {
            //     table.ajax.reload()
            //     snackbarText.value = js.message
            //     snackbar.value = true
            // });
          }
        })

    }

    const submitForm = async () => {
        const formBlastNotifRef = formBlastNotif.value
        let status = await formBlastNotifRef.validate()

        const payloadData = {
            title: formData.value.title,
            content: formData.value.content,
            link: formData.value.link
        }

        let data = Object.keys(payloadData).map((key) => encodeURIComponent(key) + "=" + ((payloadData[key] === false || payloadData[key] === undefined) ? null : encodeURIComponent(payloadData[key]))).join("&")

        if (status.valid) {
            disabled.value = true
            let urlSubmit = "/notif/blast"
            if (method.value == "PUT") urlSubmit = "/notif/blast"

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
                <v-card-title class="text-h4" style="line-height: 3rem;">Data Induk Blast Notif</v-card-title>
            </v-card-item>
        </v-col>
        <v-col>
            <v-card-actions>
                <!-- <v-col cols="8"></v-col>
                <v-col cols="7">
                    <v-row>
                    </v-row>
                </v-col> -->
                <v-spacer></v-spacer>
                <v-btn size="small" @click="reloadData" color="surface-variant" variant="text" icon="mdi-refresh"></v-btn>
                <v-btn size="small" @click="addData" color="surface-variant" variant="text" icon="mdi-plus"></v-btn>
            </v-card-actions>
        </v-col>
        </v-row>
        <v-card-text class="py-0">
            <datatable density="compact" ref="tableRef" :filter="true">
                <thead>
                    <tr>
                        <th class="text-left">
                            Tanggal
                        </th>
                        <th class="text-left">
                            Judul
                        </th>
                        <th class="text-left">
                            Pesan
                        </th>
                        <th class="text-left">
                            Link Gambar
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
                <v-form ref="formBlastNotif" v-model="valid" lazy-validation>
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
                                <v-text-field label="Pesan" v-model="formData.content" :rules="rules.msgRules" clearable required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field label="Link" hint="URL : https://ssc.rcuedu.id/paket-list?code=ssc" persistent-hint v-model="formData.link" clearable required></v-text-field>
                            </v-col>
                        </v-row>
                    </v-container>
                    </v-card-text>
                    <div class="px-10 pb-5 text-right">
                        <v-btn class="mr-5" variant="tonal" color="grey" @click="dialog = false"> Batal </v-btn>
                        <v-btn class="text-white" color="#5C9527"
                            :disabled="disabled"
                            prepend-icon="mdi-content-save"
                            :loading="disabled" text @click="submitForm"> Publish </v-btn>
                    </div>
                </v-form>
            </v-card>
        </v-dialog>
    </v-row>
    </v-card>
</template>