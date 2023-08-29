<style>
    .swal2-container {
      z-index: 100000;
    }
</style>
<script setup lang="ts">
    import {
        ref,
        onMounted
    } from 'vue'
    import $ from 'jquery';
    import { authFetch } from '../../composables/useAuth'
    import { useRouter } from 'vue-router'
    import Swal from 'sweetalert2'
    import moment from 'moment/min/moment-with-locales'
    import Datepicker from '@vuepic/vue-datepicker'
    import '@vuepic/vue-datepicker/dist/main.css'
    import { tsXLXS } from 'ts-xlsx-export';
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
    let disabled_email = ref(false)
    const photoUrl = ref('/images/background/blog-bg-2x.jpg')
    let valid = ref(true)
    let searchInput = ref('null')
    let i_filecode = ref('')
    let previewImg = ref('')
    let curr_photo_url = ref('')
    let curr_photo_code = ref('')
    let snackbar = ref(false)
    let d_avatar = ref('')
    let snackbarText = ref('')
    let formTitle = ref('')
    let formData = ref({})
    let error = ref('')
    let loading = ref(false)
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
        nikRules: [
            (v: any) => !!v || 'NIK wajib diisi',
            (v: any) => (v && v.length >= 12) || 'NIK minimal 12 karakter',
            (v: any) => (v && v.length <= 20) || 'NIK maksimal 20 karakter'
        ],
    })
    let showHideSpinner = ref(false)
    let overlay = ref(false)
    onMounted(() => {
        sessionStorage.path = '/siswa-rcu'
        moment.locale('id')
        table = createTable(tableRef, {
            ajax: '/siswa-rcu',
            filterBy: [0,1,2],
            // selectedRowClass:'',
            paramData: function (d:any) {
                d.type = 'rcu'
                d.status = 5
            },
            order: [
				[3, 'desc']
			],
            columns: [
                {
                    data: "name"
                },
                {
                    data: "nik"
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
                    data: "uuid",
                    sortable: false,
                    render: function (data, type, row, meta) {
                        // return !data ? '-' : moment(data).format("DD/MM/YYYY")
                        return `<div class="pa-2">
                            <button type="button" style="background-color:#E2F1FD;color:#2196F3" class="text-capitalize v-btn v-btn--elevated v-theme--light v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated detail-btn" data-code="${row.code}">
                                Paket (${row.jumlah ? row.jumlah : 0})
                            </button>
                        </div>`
                    }
                },
            ],
            rowClick: function(evt)
            {
                authFetch(`/siswa/`+evt.data.code+``).then((res) => {
                    return res.json()
                }).then((js) => { 
                    if(js.details.data){
                        // console.log(js.details.data)
                        formData.value = js.details.data
                        formTitle.value = 'Data User RCU'
                        dialog.value = true
                        curr_photo_url.value = js.details.data.photo_url
                        previewImg.value = js.details.data.photo_url
                        curr_photo_code.value = js.details.data.photo_code
                        disabled_email.value = true
                    }
                })
                // console.log(evt)
            }
        })
        // this.$emit('ready')
    })

    /* Methods */
    const handleClick = async (e:any) => {
        rules.value.passwordRules = []
        method.value = 'PUT'
        formTitle.value = 'Edit Data User RCU'  
        var rows = table.rows('.selected').data()
        formData.value = rows[0]
        // console.log('asd', formData.value)
        if (e.target.matches(".detail-btn")) {

            router.push({
                path : "/siswa-rcu/detail-paket/"+e.target.dataset.code
            })
        }
    }

    /* CRUD Methods */
    const reloadData = () => {
        table.ajax.reload()
    }

    const uploadImage = (e:any) => {
        d_avatar.value = 'd-flex'
        let file:any = e.length > 0 ? e[0] : null
        readURL(file)

        if (file !== null && file.size < 2000000) {
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

    const addData = () => {
        formTitle.value = 'Tambah Data User RCU'
        formData.value = {}
        method.value = 'POST'
        dialog.value = true
        disabled.value = false
        disabled_email.value = false
        formData.value.password = '12345678'
    }

    const editData = () => {
        method.value = 'PUT'
        formTitle.value = 'Edit Data User RCU'  
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
        authFetch("/siswa_rcu_register/" + user.id, {
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

    const exportToXlsx = () => {
        showHideSpinner.value = true 
        overlay.value = true
        // var tipe_paket = filteredPaketVal.value == "RCU" ? "Training" : filteredPaketVal.value
        authFetch(`/siswa_rcu/download_siswa/`+searchInput.value).then((res) => {
          return res.json()
        }).then((js) => {
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
                    const newKeys = { name: "Nama", nik:"NIK",phone: "No Telepon", email:"Email", tanggal: "Tanggal"};
                    const renamedObj = renameKeys(obj, newKeys);
                    a.push(renamedObj)
                })
                var title = 'Data Siswa RCU'
                tsXLXS().exportAsExcelFile(a).saveAsExcelFile(title);
                // console.log(tsXLXS())
                showHideSpinner.value = false
                overlay.value = false
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Tidak ada data',
                })
                showHideSpinner.value = false
                overlay.value = false
            }
        })
    }

    const exportFoto = () => {
        showHideSpinner.value = true 
        overlay.value = true
        authFetch(`/siswa_rcu/download_foto_batch?sort_cols=`+(table.order() ? table.order()[0][0]:'')+'&sort_dir='+(table.order() ? table.order()[0][1]:'')+'&search='+(table.search() ? table.search() : '')).then((res) => {
            return res.json()
        })
        .then((js) => {
            if (js) {
                var b64 = 'data:image/jpeg;base64,'+js
                fetch(
                    b64,{
                        credentials:'include'
                    }
                  )
                .then(res => res.blob())
                .then(blob => handler(blob))
                function handler(inputBlob) {
                    const url = URL.createObjectURL(inputBlob);
                    const a = document.createElement('a');
                    a.setAttribute('href', url);
                    a.setAttribute('download', 'Rekap foto user RCU '+moment().format('DD MMM YYYY')+'.zip');
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);            
                }
                showHideSpinner.value = false
                overlay.value = false
                disabled.value = false
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'File tidak dapat diunduh',
                })
                showHideSpinner.value = false
                overlay.value = false
            }
        });
    }

    $(document).on('click', '.search-datatable', function() {
        var myEl = $('.input-search-datatable');
        var input = myEl.find('input')[0].value
        searchInput.value = input
    })

    const downloadFoto = () => {
        disabled.value = true
        loading.value = true 
        if(curr_photo_code.value){           
            const payloadData = {                
                'img_code' : curr_photo_url.value
            }
            let data = Object.keys(payloadData).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(payloadData[key])).join("&")
            authFetch("/downloadFoto", {
                method: "POST",
                body: data,
                // mode: "no-cors"
                // responseType: "arraybuffer"
            })
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                var b64 = 'data:image/jpeg;base64,'+js
                fetch(
                    b64,{
                        credentials:'include'
                    }
                  )
                .then(res => res.blob())
                .then(blob => handler(blob))
                function handler(inputBlob) {
                    // console.log(inputBlob)
                    const url = URL.createObjectURL(inputBlob);
                    const a = document.createElement('a');
                    a.setAttribute('href', url);
                    a.setAttribute('download', 'gambar-siswa.jpg');
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click(); // Simulates click
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);            
                }
                loading.value = false
                disabled.value = false
            });
            // .then((res) => {
            //     if (res.status === 201) {
            //         } else if (res.status === 400) {
            //         } else if (res.status === 500){
            //             Swal.fire("Timeout!", ``, "error");
            //             this.disabled = false;
            //         }
            //     return res.arrayBuffer()                
            // })            
            // .then(blob => handler(blob))
            // function handler(inputBlob) {
            //     console.log(inputBlob)
                // var url = window.URL.createObjectURL(new Blob([previewImg.value]));
                // console.log(url)
                //     var a = document.createElement("a");
                //     a.href = url;
                //     a.download = "siswa.jpg";
                //     document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
                //     a.click();
                    // a.remove(); //afterwards we remove the element again       
                    // document.body.removeChild(a);
            // }
        } else {
            Swal.fire({
                title : 'Tidak ada Gambar!',
                icon : 'error',
            }).then((ok) => {
                if (ok.isConfirmed) {
                    Swal.close
                    loading.value = false
                    disabled.value = false
                }
            })
        }
    }
    const submitForm = async () => {
        const formUserRef = formUser.value
        let status = await formUserRef.validate()
        formData.value.type = 'rcu'
        formData.value.birth_date = moment(formData.value.birth_date).format('YYYY-MM-DD')
        // const payloadData = {
        //     'data' : JSON.stringify(formData.value),
        //     'img_code' : i_filecode.value
        // }

        // formData.value.img_code = i_filecode.value
        let userData = {
            name: formData.value.name,
            email: formData.value.email,
            phone: formData.value.phone ? formData.value.phone : '',
            password: formData.value.password,
            school: formData.value.school,
            type : 'rcu',
            // img_code: i_filecode.value,
            nik: formData.value.nik  ? formData.value.nik : '',
            birth_date: formData.value.birth_date,
            birth_place: formData.value.birth_place ? formData.value.birth_place : '',
            jenis_kelamin: formData.value.jenis_kelamin ? formData.value.jenis_kelamin : '',
            alamat: formData.value.alamat ? formData.value.alamat : formData.value.alamat
        }

        let payloadData = {
            'data' : JSON.stringify(userData),
            'img_code' : i_filecode.value
        }

        // console.log('status',status)
        // console.log('input',payloadData)
        let data = Object.keys(payloadData).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(payloadData[key])).join("&")

        if (status.valid) {
            disabled.value = true
            let urlSubmit = "/siswa_rcu_register"
            if (method.value == "PUT") urlSubmit = "/siswa_rcu_register/" + formData.value.code

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
            <v-card-title class="text-h4" style="line-height: 3rem;">Data User RCU</v-card-title>
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
            <v-row justify="end" style="margin-top: 0px !important;">
                <v-col cols="3">
                    <v-btn @click="exportToXlsx" block color="#6E8A3D" class="text-white" style="height: 56px;">
                        Download Data
                    </v-btn>
                </v-col>
                <v-col cols="3">
                    <v-btn @click="exportFoto" block color="#6E8A3D" class="text-white" style="height: 56px;">
                        Download Foto
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
                            NIK
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
                            Paket
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
                                <v-col cols="12" style="text-align: center;">
                                    <v-avatar style="margin: auto;" size="180" width="180" :class="d_avatar">
                                        <v-img ref="photo" circle class="bg-white" width="300" :aspect-ratio="1"
                                            :src="previewImg" cover></v-img>
                                    </v-avatar>
                                    <v-file-input class="mt-3"
                                        prepend-icon="mdi-camera"
                                        accept="image/png, image/jpeg, image/jpg"
                                        placeholder="Upload background" 
                                        label="Avatar"
                                        @update:modelValue="uploadImage">        
                                    </v-file-input>
                                    <v-text-field label="Nama Lengkap" class="mt-3" v-model="formData.name" :rules="rules.usernameRules"></v-text-field>
                                    <v-text-field :disabled="disabled_email" v-model="formData.email" :rules="rules.emailRules" label="E-mail"  :error-messages="error"></v-text-field>
                                    <v-text-field v-if="false" v-model="formData.password" :rules="rules.passwordRules" label="Password" type="password"></v-text-field>
                                    <v-text-field label="NIK" v-model="formData.nik" :rules="rules.nikRules" ></v-text-field>
                                    <v-text-field label="Tempat Lahir" v-model="formData.birth_place" ></v-text-field>
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
                                            auto-apply
                                            ></Datepicker>
                                            <!-- auto-apply :close-on-auto-apply="true" -->
                                    </div>
                                    <v-select
                                      label="Jenis Kelamin"
                                      v-model="formData.jenis_kelamin"
                                      :items="['Laki-laki', 'Perempuan']"
                                    ></v-select>
                                    <v-textarea label="Alamat" v-model="formData.alamat" ></v-textarea>
                                    <v-text-field label="Phone" v-model="formData.phone" ></v-text-field>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>
                    <div class="px-5 pb-5 text-right">
                        <v-btn class="mr-5" variant="tonal" color="grey" @click="dialog = false"> Batal </v-btn>
                        <v-btn class="text-white mr-5" color="#5C9527"
                            v-if="previewImg"
                            variant="flat"
                            :disabled="disabled"
                            prepend-icon="mdi-download"
                            :loading="disabled" text @click="downloadFoto"> Unduh Foto </v-btn>
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
    <div v-if="showHideSpinner" class="clock-loader"></div>
    <v-overlay v-model="overlay" :persistent="true"></v-overlay>
</template>