<script setup lang="ts">
    import {
        ref,
        onMounted
    } from 'vue'
    import $ from 'jquery';
    import { authFetch } from '../../composables/useAuth'
    import { useRouter } from 'vue-router'
    import moment from 'moment/min/moment-with-locales'
    import Datepicker from '@vuepic/vue-datepicker'
    import '@vuepic/vue-datepicker/dist/main.css'
    import { tsXLXS } from 'ts-xlsx-export';
    import Swal from 'sweetalert2'
    definePageMeta({
        middleware: ['auth']
    })
    const router = useRouter()
    let table = ref(null)
    const tableRef = ref(null)
    const formUser = ref(null)
    let method = ref('')
    let disabled = ref(false)
    let dialog = ref(false)
    const photoUrl = ref('/images/background/blog-bg-2x.jpg')
    let valid = ref(true)
    let i_filecode = ref('')
    let previewImg = ref('')
    let searchInput = ref('null')
    let snackbar = ref(false)
    let d_avatar = ref('d-none')
    let snackbarText = ref('')
    let formTitle = ref('')
    let formData = ref({})
    let error = ref('')
    let status = ref(null)
    let statusId:any = ref(null)
    let rules = ref({
        usernameRules: [
            (v: any) => !!v || 'Nama Lengkap wajib diisi',
            (v: any) => (v && v.length > 3) || 'Nama Lengkap minimal 3 karakter',
        ],
        emailRules: [
            (v: any) => !!v || 'E-mail wajib diisi',
            (v: any) => /.+@.+\..+/.test(v) || 'E-mail harus valid',
        ],
        passwordRules: [
            (v: any) => !!v || 'Password wajib diisi',
            (v: any) => (v && v.length >= 8) || 'Password minimal 8 karakter',
        ],
        // phoneRules: [
        //     (v: any) => (v.length >= 9 && v.length <= 14) && /[0-9-]+/.test(v) || 'Minimal 9 angka, Maksimal 14 angka',
        // ],
        // sekolahRules: [
        //     (v: any) => !!v || 'Asal Sekolah wajib diisi'
        // ],
        // alamatRules: [
        //     (v: any) => !!v || 'Alamat wajib diisi'
        // ],
        // jenis_kelaminRules : [
        //     (v: any) => !!v || 'Jenis kelamin wajib dipilih'
        // ],
    })
    let filteredStatus = ref([
        { name: 'Sudah Aktif', id: 0 },
        { name: 'Belum Aktif', id: 1 },
        { name: 'Blokir', id: 2 },
        { name: 'Semua', id: 3 }
    ])
    onMounted(() => {
        sessionStorage.path = '/siswa'
        moment.locale('id')
        table = createTable(tableRef, {
            ajax: '/siswa',
            filterBy: [0,1,2],
            selectedRowClass:'',
            order: [
				[3, 'desc']
			],
            paramData: function (d:any) {
                d.type = 'ssc'
                d.status = statusId.value
            },
            columns: [
                {
                    data: "name"
                },
                {
                    data: "phone",
                    render: function (data, type, row, meta) {
                        return !data ? '-' : data
                    }
                },
                {
                    data: "email"
                },
                {
                    data: "created_at", visible: true,
                    render: function (data, type, row, meta) {
                        return !data ? '-' : moment(data).format('DD MMMM YYYY, HH:mm')
                    }
                },
                {
                    data: "active",
                    render: function (data, type, row, meta) {
                        let textColor = ''
                        let bgColor = ''
                        if (row.is_banned === 1) {
                            textColor = 'red'
                            bgColor = '#FFEBEB'
                        } else {
                            if (data === 1) {
                                textColor = 'green'
                                bgColor = '#D8EED9'
                            }
                            else {
                                textColor = 'primary'
                                bgColor = '#E2F1FD'
                            }
                        }

                        return `<div class="text-center pa-2">
                                <button type="button" style="width:65%;background-color:${bgColor};" class="text-capitalize v-btn v-btn--elevated v-theme--light text-${textColor} v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated detail-tryout-btn" data-code="${row.code}"><i class="mdi-checkbox-blank-circle mdi v-icon notranslate v-theme--light v-icon--size-x-small v-icon--start" aria-hidden="true"></i>${row.active_txt}
                                </button>
                            </div>`
                    }
                },
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
        if (e.target.matches(".detail-tryout-btn")) {
            router.push({
                path: "/siswa/" + e.target.dataset.code
            })
        }
    }

    const onChangedStatus = (val:any) => {
        statusId.value = status.value.id
        reloadData()
    }

    /* CRUD Methods */
    const reloadData = () => {
        table.ajax.reload()
    }

    const uploadImage = (e:any) => {
        d_avatar.value = 'd-flex'
        let file:any = e.length > 0 ? e[0] : null
        readURL(file)

        if (file !== null && file.size < 1000000) {
            saveFile(file)
        }
    }

    const saveFile = async (file:any) => {
        var fileData = new FormData();
        fileData.append("files", file);
        // console.log(file, formData)
        fileData.append("subdir", "/avatars/");
        fileData.append("path", "avatars");

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
            let result = js.files[0]
            i_filecode.value = result.code
            // formData.filecode = result.code
        });
    }

    const readURL = async (file:any) => {
        var reader = new FileReader()
        reader.onload = (e) => {
            previewImg.value = e.target.result
        }
        reader.readAsDataURL(file)
    }

    $(document).on('click', '.search-datatable', function() {
        var myEl = $('.input-search-datatable');
        var input = myEl.find('input')[0].value
        searchInput.value = input
    })

    const exportToXlsx = () => {
        // var tipe_paket = filteredPaketVal.value == "RCU" ? "Training" : filteredPaketVal.value
        authFetch(`/siswa_ssc/download_siswa/`+statusId.value+`/`+searchInput.value).then((res) => {
          return res.json()
        }).then((js) => {
            // console.log(js)
            if ( js.length > 0)
            {
                var a = [];
                function renameKeys(obj, newKeys) {
                  const keyValues = Object.keys(obj).map(key => {
                    const newKey = newKeys[key] || key;
                    return { [newKey]: obj[key] };
                  });
                  return Object.assign({}, ...keyValues);
                }
                js.map(function(item){
                    const obj = item;
                    const newKeys = { name: "Nama", phone: "No Telepon", email:"Email", tanggal: "Tanggal", active: "Status"};
                    const renamedObj = renameKeys(obj, newKeys);
                    a.push(renamedObj)
                })
                var title = 'Data Siswa SSC'
                tsXLXS().exportAsExcelFile(a).saveAsExcelFile(title);
                // console.log(tsXLXS())
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Tidak ada data',
                })
            }
        })
    }

    const addData = () => {
        formTitle.value = 'Tambah Data Siswa SSC'
        formData.value = {}
        method.value = 'POST'
        dialog.value = true
        disabled.value = false
    }

    const editData = () => {
        formTitle.value = 'Edit Data Siswa SSC'  
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
        rules.value.passwordRules = []
    }
    
    const deleteData = () => {
        var rows = table.rows('.selected').data()
        if(!rows[0]){
            snackbarText.value = 'Data belum dipilih.'
            snackbar.value = true
            return
        }
        // console.log('delete', rows[0].id)

        let user = rows[0]
        authFetch("/siswa_register/" + user.id, {
                method: "DELETE",
                body: "id=" + user.id,
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

    const submitForm = async () => {
        const formUserRef = formUser.value
        let status = await formUserRef.validate()
        formData.value.type = 'ssc'
        formData.value.birth_date = moment(formData.value.birth_date).format('YYYY-MM-DD')
        const payloadData = {
            'data' : JSON.stringify(formData.value),
            'img_code' : i_filecode.value
        }
        // console.log('status',status)
        // console.log('input',payloadData)
        let data = Object.keys(payloadData).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(payloadData[key])).join("&")

        if (status.valid) {
            disabled.value = true
            let urlSubmit = "/siswa_register"
            if (method.value == "PUT") urlSubmit = "/siswa_register/" + formData.value.id

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
                    // console.log(js.details)
                    error.value = js.details.errors.email[0]
                    for (var key in js.details) {
                        if (js.details.hasOwnProperty(key)) {
                            // console.log(errors.push(js.details[key]))
                        }
                    }

                    return;
                }

                previewImg.value = ''
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
            <v-card-title class="text-h4" style="line-height: 3rem;">Data Siswa SSC</v-card-title>
        </v-card-item>
        </v-col>
            <v-col>
        <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn size="small" @click="reloadData" color="surface-variant" variant="text" icon="mdi-refresh"></v-btn>
              <v-btn size="small" @click="addData" color="surface-variant" variant="text" icon="mdi-plus"></v-btn>
              <v-btn size="small" @click="editData" color="surface-variant" variant="text" icon="mdi-pencil" v-if="false"></v-btn>
              <v-btn size="small" @click="deleteData" color="surface-variant" variant="text" icon="mdi-delete" v-if="false"></v-btn>
            </v-card-actions>
            </v-col>
        </v-row>
        <v-card-text class="py-0">
            <v-row justify="end">
                <v-col md="3" sm="6">
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
            <v-row justify="end" style="margin-top: 0px !important;">
                <v-col cols="6">
                    <v-btn @click="exportToXlsx" block color="#6E8A3D" class="text-white" style="height: 56px;">
                        Download Data
                    </v-btn>
                </v-col>
            </v-row>
            <datatable density="compact" ref="tableRef" :filter="true">
                <thead>
                    <tr>
                        <th class="text-left">
                            Nama
                        </th>
                        <th class="text-left">
                            No. Telepon
                        </th>
                        <th class="text-left">
                            Email
                        </th>
                        <th class="text-left">
                            Tanggal
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
        <v-dialog v-model="dialog" persistent scrollable max-width="450px">
            <v-card>
                <v-form ref="formUser" v-model="valid" lazy-validation>
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
                                    <v-avatar style="margin: auto;" size="180" width="180" :class="d_avatar">
                                        <v-img ref="photo" circle class="bg-white" width="300" :aspect-ratio="1"
                                            :src="previewImg" cover></v-img>
                                    </v-avatar>
                                    <v-file-input class="mt-3 mb-2"
                                        prepend-icon="mdi-camera"
                                        accept="image/png, image/jpeg, image/jpg"
                                        placeholder="Upload background" 
                                        label="Avatar"
                                        hint="* Gambar max 1mb"
                                        persistent-hint
                                        @update:modelValue="uploadImage">        
                                    </v-file-input>
                                    <v-text-field label="Nama Lengkap" v-model="formData.name" :rules="rules.usernameRules" clearable required></v-text-field>
                                    <v-text-field v-model="formData.email" :rules="rules.emailRules" label="E-mail" required clearable :error-messages="error"></v-text-field>
                                    <v-text-field v-model="formData.password" :rules="rules.passwordRules" label="Password" type="password" clearable required></v-text-field>
                                    <v-text-field label="Phone" v-model="formData.phone" clearable></v-text-field>
                                    <v-text-field label="Tempat Lahir" v-model="formData.birth_place"></v-text-field>
                                    <div class="d-flex flex-column" style="row-gap: 8px;margin-bottom: 22px">
                                        <span class="font-14-l16 black-04 font-weight-medium" style="text-align:left">Tanggal Lahir</span>
                                        <Datepicker 
                                            v-model="formData.birth_date" 
                                            placeholder="Tanggal Lahir" 
                                            format="dd/MM/yyyy" 
                                            :enable-time-picker="false" 
                                            month-name-format="long"
                                            locale="id"
                                            input-class-name="dp-custom-input"
                                            autofocus="true"
                                            ></Datepicker>
                                            <!-- auto-apply :close-on-auto-apply="true" -->
                                    </div>
                                    <v-select
                                      label="Jenis Kelamin"
                                      v-model="formData.jenis_kelamin"
                                      :items="['Laki-laki', 'Perempuan']"
                                    ></v-select>
                                    <v-textarea label="Alamat" v-model="formData.alamat" ></v-textarea>
                                    <v-text-field label="Asal Sekolah" v-model="formData.sekolah" required clearable></v-text-field>
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