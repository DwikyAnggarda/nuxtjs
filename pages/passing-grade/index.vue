<style>
    .swal2-container {
      z-index: 100000;
    }
</style>
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
    const formPassingGrade = ref(null)
    let method = ref('')
    let disabled = ref(false)
    let dialog = ref(false)
    let valid = ref(true)
    let snackbar = ref(false)
    let isActive = ref(false)
    let previewImg = ref(null)
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
            (v: any) => !!v || 'Nama Universitas wajib diisi',
            // (v: any) => (v && v.length >= 3) || 'Nama Universitas minimal 3 karakter',
        ],
        codeRules: [
            (v: any) => !!v || 'Prefix wajib diisi',
            // (v: any) => (v && v.length >= 3) || 'Prefix minimal 3 karakter',
        ]
    })
    onMounted(() => {
        sessionStorage.path = '/passing-grade'
        table = createTable(tableRef, {
            ajax: '/passing_grade',
            filterBy: [0,4],
            order: [
                [1, 'desc']
            ],
            // paramData: function (d:any) {
            //     d.status = statusId.value
            //     // if (!statusId.value) {
            //     // }
            // },
            columns: [
                {
                    data: "name",
                    render: function (data, type, row, meta) {
                        var photo_url = '/images/background/blog-bg-2x.jpg'
                        if(row.image_name){
                            photo_url = row.image_url
                        }
                        return `
                            <div class="d-flex flex-row pa-2 align-center">
                                <div class="mr-3">
                                   <img ref="previewImg" class="img-user" src="` + photo_url + `" alt="profile photo"/>
                                </div>
                                <div class"d-flex flex-column">
                                   <span>` + row.name + `</span>
                                </div>
                            </div>
                        `
                    }
                },
                {
                    data: "id",
                    visible: false
                },
                {
                    data: "active",
                    render: function (data, type, row, meta) {
                        let textColor = ''
                        let bgColor = ''
                        let textMsg = ''
                        if (data === 1) {
                            textColor = 'green'
                            bgColor = '#D8EED9'
                            textMsg = 'Aktif'
                        } else {
                            textColor = 'red'
                            bgColor = '#FFEBEB'
                            textMsg = 'Tidak Aktif'
                        }

                        return `<div class="text-center pa-2">
                                <button type="button" style="width:65%;background-color:${bgColor};" class="text-capitalize v-btn v-btn--elevated v-theme--light text-${textColor} v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated"><i class="mdi-checkbox-blank-circle mdi v-icon notranslate v-theme--light v-icon--size-x-small v-icon--start" aria-hidden="true"></i>${textMsg}
                                </button>
                            </div>`
                    }
                },
                {
                    data: "action",
                    sortable: false,
                    render: function (data, type, row, meta) {
                        return `<div class="pa-2">
                        <button type="button" style="background-color:#E2F1FD;color:#2196F3" class="text-capitalize v-btn v-btn--elevated v-theme--light v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated detail-tryout-btn" data-code="${row.code}">Program Studi (${row.count_jurusan ? row.count_jurusan : 0})
                        </button>
                        </div>`
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
        if (e.target.matches(".detail-tryout-btn")) {
            router.push({
                path: "/passing-grade/" + e.target.dataset.code
            })
        }
    }

    const onChangedStatus = (val:any) => {
        statusId.value = status.value.id
        reloadData()
    }

    const readURL = async (file:any) => {
        var reader = new FileReader()
        reader.onload = (e) => {
            previewImg.value = e.target.result
        }
        reader.readAsDataURL(file)
    }

    const uploadImage = (e:any) => {
        let file:any = e.length > 0 ? e[0] : null
        readURL(file)

        if (file !== null && file.size < 1000000) {
            saveFile(file)
        }
    }

    const saveFile = async (file:any) => {
        var fileData = new FormData();
        fileData.append("files", file);
        console.log(file, formData)
        fileData.append("subdir", "/university/");
        fileData.append("path", "university");
        Swal.fire({
          title: 'Proses Upload',
          text: 'Loading',
          showConfirmButton: false,
        })
        authFetch("/upload", {
            method: "POST",
            body: fileData,
            headers: {
                "Content-Type": null,
            },
        })
        .then((res) => {
            if (res.status === 201) {
            } else if (res.status === 400) {
            }
            return res.json();
        })
        .then((js) => {
            Swal.close()
            console.log(js.files[0])
            if (js.files[0].status == false) {
                previewImg.value = '';
                Swal.fire({
                  icon: 'error',
                  title: 'Upload Gagal',
                  text: js.files[0].error,
                  buttons: false
                })
            } else {
                Swal.fire({
                  icon: 'success',
                  title: 'Upload Sukses',
                  text: 'Sukses',
                  buttons: false
                })
                let result = js.files[0]
                
                formData.value.image = result.file_name
            }
        });
    }

    /* CRUD Methods */
    const reloadData = () => {
        table.ajax.reload()
    }

    const addData = () => {
        formTitle.value = 'Tambah Data Passing Grade'
        formData.value = {}
        method.value = 'POST'
        dialog.value = true
        disabled.value = false
        previewImg.value = '/images/background/blog-bg-2x.jpg'
    }

    const editData = () => {
        formTitle.value = 'Edit Data Passing Grade'
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
        if(rows[0].image_name){
            previewImg.value = rows[0].image_url
        } else{
            previewImg.value = '/images/background/blog-bg-2x.jpg'
        }
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
            let passing_grade = rows[0]
            authFetch("/passing_grade/" + passing_grade.id, {
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
        const formPassingGradeRef = formPassingGrade.value
        let status = await formPassingGradeRef.validate()

        const payloadData = {
            image: formData.value.image ? formData.value.image : '',
            name: formData.value.name,
            active: isActive.value !== false ? 1 : 0
        }

        let data = Object.keys(payloadData).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(payloadData[key])).join("&")

        if (status.valid) {
            disabled.value = true
            let urlSubmit = "/passing_grade"
            if (method.value == "PUT") urlSubmit = "/passing_grade/" + formData.value.id

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
    const importdata = () => {
        router.push({
            path : "/passing-grade/import"
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
                    <v-card-title class="text-h4" style="line-height: 3rem;">Data Induk Passing Grade</v-card-title>
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
                    <v-btn size="small" @click="importdata" variant="tonal" style="height: 28px !important; background-color: rgb(110, 138, 61); color:white;">Import</v-btn>
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
                            Nama Universitas
                        </th>
                        <th class="text-left">
                            Id
                        </th>
                        <th class="text-left">
                            Status
                        </th>
                        <th class="text-left">
                            Action
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
                <v-form ref="formPassingGrade" v-model="valid" lazy-validation>
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
                                <v-text-field label="Nama Universitas" v-model="formData.name" :rules="rules.nameRules" clearable required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-row>
                                    <v-col>
                                        <v-file-input 
                                            :rules="rules.fileRules"
                                            hint="* Gambar max 1mb"
                                            persistent-hint
                                            prepend-icon="mdi-camera"
                                            accept="image/png, image/jpeg, image/jpg"
                                            placeholder="Upload Gambar" 
                                            label="Upload Logo"
                                            v-model="backgroundFile"
                                            @update:modelValue="uploadImage">
                                        </v-file-input>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-img class="bg-white mx-auto" style="width:70%" :aspect-ratio="4 / 3" :src="previewImg"></v-img>
                                    </v-col>
                                </v-row>
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