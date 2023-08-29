<script lang="ts">
    import {
        ref,
        reactive
    } from "vue";
    import { authFetch, useUser } from '../composables/useAuth'
    import Swal from 'sweetalert2'

    export default {
        /*setup() {
            const form = reactive({
                name: 'xxx2314444444444',
                email: '',
            })
            onMounted(async() => {
                const user = await useUser()
                console.log('userrx', user.email)
                form.email = user.email;
            });
            return {form}
        },*/
        data: () => ({
            valid: true,
            errors: '',
            errors_phone: '',
            name: '',
            email: '',
            phone: '',
            newEmail: '',
            currPass: '',
            myPass: '',
            newPass: '',
            loading: false,
            photoUrl: '',
            nameRules: [
                v => !!v || 'Nama wajib diisi',
                // v => (v && v.length >= 8) || 'Nama harus lebih dari 8 karakter',
            ],
            phoneRules: [
                v => !!v || 'Nomor Telepon wajib diisi',
                v => (v.length >= 9 && v.length <= 14) && /[0-9-]+/.test(v) || 'Minimal 9 angka, Maksimal 14 angka',
                // v => (v && v.length >= 8) || 'Nama harus lebih dari 8 karakter',
            ],
            emailRules: [
                v => !!v || 'E-mail wajib diisi',
                v => /.+@.+\..+/.test(v) || 'E-mail harus valid',
            ],
            passRules: {
                required: value => !!value || 'Required.',
                min: v => v.length >= 8 || 'Min 8 characters',
            },
            modalEmail: false,
            showMyPass: false,
        }),

        created() {
            sessionStorage.path = '/profile'
            this.initData();
        },
        methods: {
            async save() {
                // console.log('asd',this.$refs.form.length)
                const {
                    valid
                } = await this.$refs.form.validate()
                if (!valid) return;
                this.loading = true;
                var data = new URLSearchParams();
                data.set('name', this.name);
                data.set('phone', this.phone);
                data.set('current_password', this.currPass);
                data.set('new_password', this.newPass);
                const response = await authFetch("/profile", {
                    method: 'PUT',
                    body: data
                });
                var output = await response.json();
                if(!output.success) {
                    this.errors_phone = output.details.errors.phone[0];
                    this.loading = false;
                }
                
                if(output.success)alert(output.message)
                this.loading = false;
                return;
                // else alert(output.message)
            },
            async initData() {
                const user = await useUser()
                if (!user) return;
                this.name = user.name;
                this.email = user.email;
                this.phone = user.phone;
                this.photoUrl = user.photo_url;
            },
            changeEmail: async function () {
                this.loading = true;
                var data = new URLSearchParams();
                data.set('email', this.newEmail);
                data.set('password', this.myPass);
                const response = await authFetch("/profile/change_email", {
                    method: 'PUT',
                    body: data
                });
                var output = await response.json();
                this.loading = false;
                if(!output.success) {
                    this.errors = output.message;
                    return;
                } else {
                    this.initData();
                    this.myPass = '';
                    this.newEmail = '';
                    this.modalEmail = false;
                }
            },
            cancelChangeEmail: function () {
                this.myPass = '';
                this.newEmail = '';
                this.modalEmail = false;
            },
            editEmail() {
                this.modalEmail = true;
            },
            browseFile(){
                //alert('browse')
                console.log(this.$refs.files)
                this.$refs.files.click();//dispatchEvent(new Event('click'))
            },
            readURL: function (file) {
                var reader = new FileReader();
                var photo = this.$refs.photo;
                reader.onload = function (e) {
                    photo.setAttribute('src', e.target.result)
                };
                reader.readAsDataURL(file); // convert to base64 string
            },
            changePicture: function (e) {
                var files = e.target.files;
                if (files[0] !== null && files[0].size < 1000000) { 
                    var formData = new FormData();
                    formData.append("file", files[0]);
                    this.readURL(files[0])
                    console.log(files, formData)
                    formData.append("subdir", "/profile_upload/");

                    authFetch("/profile/avatar", {
                        method: "POST",
                        body: formData,
                        headers: {
                            "Content-Type": null,
                        },
                    })
                    .then((res) => {
                        if (res.ok) {
                            return res.json();
                        }
                        throw new Error('Something went wrong');
                    })
                    .then((js) => {
                        console.log(js)
                    }).catch(error => {
                        console.log('error upload', error)
                    })
                } else {
                    Swal.fire(
                      'Gambar Terlalu Besar',
                      'Harap Pilih Gambar dibawah 1mb',
                      'error'
                    )
                }
                console.log(files)
            }
        },
    }

    definePageMeta({
        middleware: ['auth']
    })
</script>
<template>
    <v-row>
        <v-col cols="12" sm="12" lg="8">
            <v-card class="mx-auto">
                <v-card-item title="Profile">
                    <template v-slot:subtitle>
                        Data diri
                    </template>
                </v-card-item>
                <v-card-text>
                    <v-form ref="form" v-model="valid" lazy-validation>
                        <v-text-field v-model="name" :rules="nameRules" label="Nama" required></v-text-field>

                        <v-text-field v-model="email" readonly="true" :rules="emailRules" label="E-mail"
                            append-icon="mdi-pencil" @click:append="editEmail" required>
                        </v-text-field>

                        <v-text-field v-model="currPass" type="password" label="Password Lama"></v-text-field>

                        <v-text-field v-model="newPass" type="password" label="Password Baru"></v-text-field>

                        <v-text-field v-model="phone" :rules="phoneRules" label="Nomor HP" :error-messages="errors_phone" required>
                        </v-text-field>

                        <v-btn :disabled="loading" prepend-icon="mdi-checkbox-marked-circle" color="success" class="me-4" @click="save">
                            {{loading ? 'Simpan...' : 'Simpan'}}
                        </v-btn>

                    </v-form>
                </v-card-text>

            </v-card>
        </v-col>
        <v-col cols="12" sm="12" lg="4">
            <v-card>
                <img ref="photo" style="width: 100%" :src="photoUrl" />
                <p class="text-caption">* Gambar max 1mb</p>
                <v-card-text>
                    <input type="file" ref="files" multiple name="files[]" accept="image/jpeg" style="display:none;"  @change="changePicture" />
                    <v-btn icon color="primary" @click="browseFile" >
                    <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                </v-card-text>
            </v-card>
        </v-col>
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
                        :error-messages="errors"
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
    </v-row>
</template>