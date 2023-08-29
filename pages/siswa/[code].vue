<script setup lang="ts">
    import {
        ref,
        onMounted,
        computed
    } from 'vue'
    import { authFetch } from '../../composables/useAuth'
    import { useRoute, useRouter } from 'vue-router'
    import Swal from 'sweetalert2'
    import Datepicker from '@vuepic/vue-datepicker'
    import '@vuepic/vue-datepicker/dist/main.css'
    import moment from 'moment/min/moment-with-locales'

    definePageMeta({
        middleware: ['auth']
    })

    const route = useRoute();
    const router = useRouter();
    const formUser = ref(null)
    const tableRef = ref(null)
    const avatar = ref('/images/background/blog-bg-2x.jpg')
    let snackbar = ref(false)
    let show1 = ref(false)
    let snackbarText = ref('')
    let table = ref(null)
    let method = ref('')
    let loading = ref([])
    let disabled = ref(false)
    let disabledBtnImg = ref(false)
    let dialog = ref(false)
    let valid = ref(true)
    let isActive = ref(false)
    let formTitle = ref('')
    let searchinG = ref('')
    let formData = ref({})
    let dataSiswa = ref(null)
    let selected = ref([])
    let filesRef = ref(null)
    let error_phone = ref('')
    let photoUrl = ref(null)
    let previewImg = ref(null)
    let rules = ref({
        nameRules: [
            (v: any) => !!v || 'Nama Lengkap wajib diisi',
            (v: any) => (v && v.length > 3) || 'Nama Lengkap minimal 3 karakter',
        ],
        passwordRules: [],
        emailRules: [
            (v: any) => !!v || 'E-mail wajib diisi',
            (v: any) => /.+@.+\..+/.test(v) || 'E-mail harus valid',
        ],
        // phoneRules: [
        //     (v: any) => (v.length >= 9 && v.length <= 14) && /[0-9-]+/.test(v) || 'Minimal 9 angka, Maksimal 14 angka',
        // ],
    })
    onMounted(() => {
        sessionStorage.path = '/siswa/detail'
        getSiswa()
    })

    /* Methods */
    const handleClick = async (e:any) => {
    }

    const getSiswa = async () => {
            authFetch('/siswa/'+route.params.code)
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                formData.value = js.details.data
                formData.value.active_txt = formData.value.active === 0 ? 'Belum Aktif' : formData.value.active === 1 ? 'Sudah Aktif' : 'Blokir'

                if (formData.value.photo_code === null) {
                    photoUrl.value = '/images/background/blog-bg-2x.jpg'
                } else {
                    photoUrl.value = formData.value.photo_url
                }
            });
    }

    const browseFile = () => {
        // this.$refs.files.click();//dispatchEvent(new Event('click'))
        console.log('inp files',filesRef.value)
        let ff = filesRef.value
        ff.click()
    }

    const readURL = async (file:any) => {
        var reader = new FileReader()
        var photo = previewImg.value
        reader.onload = function (e) {
            photo.setAttribute('src', e.target.result)
        };
        reader.readAsDataURL(file) // convert to base64 string
    }

    const uploadImage = (e:any) => {
        var files = e.target.files;
        var fileData = new FormData()
        fileData.append("files", files[0])
        let file_name = files[0].name

        readURL(files[0])

        if (file_name.toLowerCase().split(".")[1] === 'jpeg') {
            Swal.fire("Proses gagal", `Tidak bisa upload gambar format JPEG, gunakan format lain (JPG, PNG).`, "error")
            photoUrl.value = formData.value.photo_url
            return false
        }

        fileData.append("subdir", "/avatars/")
        fileData.append("path", "avatars")

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
            return res.json()
        })
        .then((js) => {
            let result = js.files[0]
            formData.value.file_code = result.code
            saveImg()
        });
    }

    const saveImg = () => {
        let payloadData = {file_code: formData.value.file_code}
        let data = Object.keys(payloadData).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(payloadData[key])).join("&")

        let urlSubmit = `/siswa/${route.params.code}/image`
        authFetch(urlSubmit, {
            method: 'PUT',
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

            snackbarText.value = js.message
            snackbar.value = true
            getSiswa()
        })
    }

    /* CRUD Methods */
    const submitApproval = (active:number, i_disabled:number, is_banned:boolean = false) => {
        loading.value[i_disabled] = true
        let payloadData = {}
        let urlSubmit = ''

        if (is_banned === false) {
            payloadData = {set_active: active}
            urlSubmit = `/siswa/${route.params.code}/approval`
        } else {
            payloadData = {set_banned: active}
            urlSubmit = `/siswa/${route.params.code}/banned`
        }

        let data = Object.keys(payloadData).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(payloadData[key])).join("&")

        authFetch(urlSubmit, {
            method: 'PUT',
            body: data,
        })
        .then((res) => {
            if (res.status === 201) {
            } else if (res.status === 400) {
            }
            return res.json()
            })
        .then((js) => {
            loading.value[i_disabled] = false
            let errors = []
            if (!js.success) {
                for (var key in js.details) {
                    if (js.details.hasOwnProperty(key)) {
                        console.log(errors.push(js.details[key]))
                    }
                }

                return;
            }

            snackbarText.value = js.message
            snackbar.value = true
            getSiswa()
        })
    }

    const submitForm = async (i_disabled:number) => {
        const formUserRef = formUser.value
        let status = await formUserRef.validate()
        formData.value.birth_date = moment(formData.value.birth_date).format('YYYY-MM-DD')
        let payloadData = {
            'name': formData.value.name,
            'email': formData.value.email,
            'phone': formData.value.phone ? formData.value.phone : '',
            'newpassw': formData.value.newpassw,
            'school': formData.value.school ? formData.value.school : '',
            'type ': 'ssc',
            'birth_date': formData.value.birth_date,
            'birth_place': formData.value.birth_place ? formData.value.birth_place : '',
            'jenis_kelamin': formData.value.jenis_kelamin ? formData.value.jenis_kelamin : '',
            'alamat': formData.value.alamat ? formData.value.alamat : ''
        }

        if (status.valid) {
            let data = Object.keys(payloadData).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(payloadData[key])).join("&")

            loading.value[i_disabled] = true
            let urlSubmit = "/siswa/" + route.params.code

            authFetch(urlSubmit, {
                method: 'PUT',
                body: data,
            })
            .then((res) => {
                if (res.status === 201) {
                } else if (res.status === 400) {
                }
                return res.json()
                })
            .then((js) => {
                loading.value[i_disabled] = false
                let errors = []
                if (!js.success) {
                    console.log(js);
                    if(js.message)
                    {
                        error_phone.value = js.message
                    }
                    for (var key in js.details) {
                        if (js.details.hasOwnProperty(key)) {
                            console.log(errors.push(js.details[key]))
                        }
                    }

                    return;
                }

                snackbarText.value = js.message
                snackbar.value = true
                getSiswa()
            })
        }
    }
</script>
<template>
    <v-container>
        <v-row justify="center">
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
            <v-card max-width="900" width="900">
                <v-card-item title="Profile">
                </v-card-item>
                <v-card-text>
                    <v-row>
                        <v-col cols="12" sm="12" lg="4">
                            <v-list class="p-0">
                                <v-list-item class="text-center">
                                    <!-- <v-badge
                                        bordered
                                        bottom
                                        color="warning"
                                        offset-x="0"
                                        offset-y="160">
                                        <v-avatar size="180" width="180">
                                            <v-img ref="photo" circle class="bg-white" width="300" :aspect-ratio="1"
                                            :src="photoUrl" cover></v-img>
                                            <img :src="photoUrl" alt="Profile Photo" width="180" style="object-fit: cover;"/>
                                        </v-avatar>
                                    </v-badge> -->
                                    <v-card>
                                        <img ref="previewImg" :src="photoUrl" class="w-100" alt="profile photo" style="border-radius:3%;" />
                                        <div class="d-flex justify-center mt-n14">
                                            <v-avatar size="100">
                                                <!-- <img :src="photoUrl" width="100" alt="" /> -->
                                                <v-btn
                                                    color="cyan-lighten-2"
                                                    icon="mdi-pencil"
                                                    variant="flat"
                                                    size="large"
                                                    @click="browseFile"
                                                    :disabled="disabledBtnImg"
                                                ></v-btn>
                                                <input type="file" ref="filesRef" name="files" accept="image/jpeg" style="display:none;"  @change="uploadImage" />
                                            </v-avatar>
                                        </div>
                                    </v-card>
                                </v-list-item>
                            </v-list>
                        </v-col>

                        <v-col cols="12" sm="12" lg="8">
                            <v-form ref="formUser" v-model="valid" lazy-validation>
                                <v-row>
                                    <v-col cols="6" sm="6" lg="6">
                                        <v-row>
                                            <v-col cols="12" sm="12" lg="12">
                                                <v-text-field v-model="formData.name" :rules="rules.nameRules" label="Nama" required></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="12" lg="12">
                                                <v-text-field v-model="formData.email" :disabled="true" type="email" :rules="rules.emailRules" label="Email" required>
                                                </v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="12" lg="12">
                                                <v-text-field label="Tempat Lahir" v-model="formData.birth_place" :rules="rules.birth_placeRules" ></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="12" lg="12">
                                                <div class="d-flex flex-column" style="row-gap: 8px;margin-bottom: 22px">
                                                    <span class="font-14-l16 black-04 font-weight-medium" style="text-align:left">Tanggal Lahir</span>
                                                    <Datepicker 
                                                        v-model="formData.birth_date" 
                                                        placeholder="Tanggal Lahir" 
                                                        format="dd/MM/yyyy" 
                                                        :enable-time-picker="false" 
                                                        month-name-format="long"
                                                        locale="id"
                                                        autofocus="true"
                                                        class="date-no-border"
                                                        ></Datepicker>
                                                        <!-- auto-apply :close-on-auto-apply="true" -->
                                                </div>
                                            </v-col>
                                            <v-col cols="12" sm="12" lg="12">
                                                <v-text-field :error-messages="error_phone" v-model="formData.phone" type="text" label="Nomor Telepon"></v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                    <v-col cols="6" sm="6" lg="6">
                                        <v-row>
                                            <v-col cols="12" sm="12" lg="12">
                                                <v-text-field v-model="formData.newpassw"
                                                    :append-inner-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                                                    :type="show1 ? 'text' : 'password'" 
                                                    label="Password"
                                                    placeholder="Enter password"
                                                    counter
                                                    @click:append-inner="show1 = !show1"
                                                    class="input-normal"
                                                    variant="solo"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="12" lg="12">
                                                <v-text-field v-model="formData.school" type="text" label="Asal Sekolah"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="12" lg="12">
                                                <v-select
                                                  label="Jenis Kelamin"
                                                  v-model="formData.jenis_kelamin"
                                                  :rules="rules.jenis_kelaminRules"
                                                  :items="['Laki-laki', 'Perempuan']"
                                                ></v-select>
                                            </v-col>
                                            <v-col cols="12" sm="12" lg="12">
                                                <v-textarea label="Alamat" v-model="formData.alamat" :rules="rules.alamatRules" ></v-textarea>
                                            </v-col>
                                            <v-col cols="12" sm="12" lg="12">
                                                <v-text-field v-model="formData.active_txt" :readonly="true" type="text" label="Status"></v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>
                                <v-card-actions>
                                    <NuxtLink to="/siswa" style="text-decoration: none;"><v-btn color="warning" variant="flat" class="ml-n4 me-2" size="small"> Kembali </v-btn></NuxtLink>
                                    <v-btn color="primary" variant="flat" class="me-2" size="small" @click="submitApproval(1, 1)" :disabled="formData.active === 1 ? true : loading[1]" :loading="loading[1]">
                                    Aktivasi
                                    </v-btn>
                                    <v-btn color="error" variant="flat" class="me-2" size="small" @click="formData.is_banned === 1 ? submitApproval(0, 2, true) : submitApproval(1, 2, true)" :disabled="formData.active === 0 ? true : loading[2]" :loading="loading[2]">
                                    {{ formData.is_banned === 1 ? 'Buka Blokir' : 'Blokir' }}
                                    </v-btn>
                                    <v-btn color="success" variant="flat" size="small" @click="submitForm(3)" :disabled="loading[3]" :loading="loading[3]">
                                    Simpan
                                    </v-btn>
                                    <!-- <v-btn variant="tonal" :disabled="loading"
                                        prepend-icon="mdi-checkbox-marked-circle" color="success" class="me-4"
                                        @click="save">
                                        {{loading ? 'Simpan...' : 'Simpan'}}
                                    </v-btn>
                                    <v-btn variant="tonal" :disabled="loading"
                                        prepend-icon="mdi-checkbox-marked-circle" color="success" class="me-4"
                                        @click="save">
                                        {{loading ? 'Simpan...' : 'Simpan'}}
                                    </v-btn>
                                    <v-btn @click="modalPassword=true" color="primary">
                                        Ganti Password
                                    </v-btn> -->
                                </v-card-actions>
                            </v-form>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-row>
        <v-dialog v-model="modalPassword" persistent max-width="400">
            <v-card>
                <v-card-title class="text-h5">
                    Ganti Password
                </v-card-title>
                <v-card-text>
                    <v-text-field v-model="currPass" :append-inner-icon="showOldPass ? 'mdi-eye' : 'mdi-eye-off'"
                        :rules="[passRules.required, passRules.min]" :type="showOldPass ? 'text' : 'password'"
                        placeholder="Masukkan password lama" counter @click:append-inner="showOldPass = !showOldPass"
                        label="Password Lama"></v-text-field>

                    <v-text-field v-model="newPass" :append-inner-icon="showNewPass ? 'mdi-eye' : 'mdi-eye-off'"
                        :rules="[passRules.required, passRules.min]" :type="showNewPass ? 'text' : 'password'"
                        placeholder="Masukkan password baru" counter @click:append-inner="showNewPass = !showNewPass"
                        label="Password Baru"></v-text-field>

                    <v-text-field v-model="newPass2" :append-inner-icon="showNewPass2 ? 'mdi-eye' : 'mdi-eye-off'"
                        :rules="[passRules.required, passRules.min]" :type="showNewPass2 ? 'text' : 'password'"
                        placeholder="Konfirmasi password baru" counter
                        @click:append-inner="showNewPass2 = !showNewPass2" label="Konfirmasi Password Baru">
                    </v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green-darken-1" variant="elevates" @click="changePass">
                        Simpan Perubahan
                    </v-btn>
                    <v-btn color="danger" variant="text" @click="cancelChangePass">
                        Batal
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="modalEmail" persistent max-width="400">
            <v-card>
                <v-card-title class="text-h5">
                    Ganti Email
                </v-card-title>
                <v-card-text>
                    <v-text-field v-model="newEmail" type="email"
                        placeholder="Masukkan Email baru"
                        label="Email Baru"></v-text-field>

                    <v-text-field v-model="myPass" :append-inner-icon="showMyPass ? 'mdi-eye' : 'mdi-eye-off'"
                        :rules="[passRules.required, passRules.min]" :type="showMyPass ? 'text' : 'password'"
                        placeholder="Masukkan password" counter @click:append-inner="showMyPass = !showMyPass"
                        label="Password"></v-text-field>

                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green-darken-1" variant="elevates" @click="changeEmail">
                        Simpan Perubahan
                    </v-btn>
                    <v-btn color="danger" variant="text" @click="cancelChangeEmail">
                        Batal
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>