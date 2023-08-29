<script setup lang="ts">
    import {
        ref,
        onMounted
    } from 'vue'
    import { authFetch } from '../composables/useAuth'
    import Swal from 'sweetalert2'
    definePageMeta({
        middleware: ['auth']
    })
    let table = ref(null)
    const tableRef = ref(null)
    const formUser = ref(null)
    let method = ref('')
    let disabled = ref(false)
    let loading = ref(false)
    let dialog = ref(false)
    let valid = ref(true)
    let snackbar = ref(false)
    let snackbarText = ref('')
    let formTitle = ref('')
    let formData = ref({})
    let error = ref('')
    let error_phone = ref('')
    let rules = ref({
        usernameRules: [
            (v: any) => !!v || 'Nama wajib diisi',
            (v: any) => (v && v.length > 3) || 'Nama minimal 3 karakter',
        ],
        passwordRules: [],
        emailRules: [
            (v: any) => !!v || 'E-mail wajib diisi',
            (v: any) => /.+@.+\..+/.test(v) || 'E-mail harus valid',
        ],
        phoneRules: [
            (v: any) => !!v || 'Nomor HP wajib diisi',
            (v: any) => (v.length >= 9 && v.length <= 14) && /[0-9-]+/.test(v) || 'Minimal 9 angka, Maksimal 14 angka',
        ],
    })
    onMounted(() => {
        sessionStorage.path = '/users'
        table = createTable(tableRef, {
            ajax: '/users',
            filterBy: [0,1],
            order: [
				[2, 'desc']
			],
            columns: [{
                    data: "name"
                },
                {
                    data: "email"
                },
                {
                    data: "created_at", visible: false
                }
            ]
        })
        // this.$emit('ready')
    })

    const reloadData = () => {
        table.ajax.reload()
    }

    const addData = () => {
        formTitle.value = 'Tambah Data User'
        formData.value = {}
        method.value = 'POST'
        dialog.value = true
        disabled.value = false
        rules.value.passwordRules = [
            (v: any) => !!v || 'Password wajib diisi',
            (v: any) => (v && v.length >= 8) || 'Password minimal 8 karakter',
        ]
    }

    const editData = () => {
        formTitle.value = 'Edit Data User'  
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

        if(rows[0].role_user == 'keuangan'){
            formData.value.role_user = 'Keuangan'
        } else if (rows[0].role_user == 'kesiswaan') {
            formData.value.role_user = 'Akademik'
        } else {
            formData.value.role_user = 'Super User'
        }
    }
    
    const deleteData = () => {
        var rows = table.rows('.selected').data()
        if(!rows[0]){
            snackbarText.value = 'Data belum dipilih.'
            snackbar.value = true
            return
        }
        // console.log('delete', rows[0].id)

        Swal.fire({
          title: 'Konfirmasi Hapus?',
          text: 'Hapus Data '+rows[0].name,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Oke',
          cancelButtonText: 'Batal',
        }).then((result) => {
          if (result.isConfirmed) {
            let user = rows[0]
            authFetch("/users/" + user.id, {
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
        })

    }

    const submitForm = async () => {
        const formUserRef = formUser.value
        let status = await formUserRef.validate()
        let data = Object.keys(formData.value).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(formData.value[key])).join("&")

        if (status.valid) {
            disabled.value = true
            loading.value = true
            let urlSubmit = "/users"
            if (method.value == "PUT") urlSubmit = "/users/" + formData.value.id

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
                    // if(js.details.errors.email[0])
                    // {
                    //     error.value = js.details.errors.email[0]
                    // }
                    if(js.details.errors.phone[0])
                    {
                        error_phone.value = js.details.errors.phone[0]
                    }
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
            <v-card-title class="text-h4" style="line-height: 3rem;">Data User</v-card-title>
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
            <datatable density="compact" ref="tableRef" :filter="true">
                <thead>
                    <tr>
                        <th class="text-left">
                            Name
                        </th>
                        <th class="text-left">
                            Email
                        </th>
                        <th class="text-left">
                            Created At
                        </th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </datatable>
        </v-card-text>
        <v-row justify="center">
        <v-dialog v-model="dialog" persistent max-width="450px">
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
                                <v-text-field label="Nama" v-model="formData.name" :rules="rules.usernameRules" clearable required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-select clearable label="Role"
                                    :items="['Super User', 'Akademik', 'Keuangan']"
                                    v-model="formData.role_user"
                                    >
                                </v-select>
                            </v-col>
                            <v-col cols="12" sm="6" md="4" v-if="false">
                                <v-text-field label="Legal middle name" hint="example of helper text only on focus" clearable></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="4" v-if="false">
                                <v-text-field label="Legal last name*" hint="example of persistent helper text" clearable persistent-hint required ></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model="formData.email" :rules="rules.emailRules" label="E-mail" required clearable :error-messages="error"></v-text-field>
                                <!-- <v-text-field label="Email" v-model="formData.email" :rules="rules.emailRules" clearable required ></v-text-field> -->
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model="formData.password" :rules="rules.passwordRules" label="Password" type="password" clearable required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field label="Phone" :error-messages="error_phone" :rules="rules.phoneRules" v-model="formData.phone" clearable></v-text-field>
                            </v-col>
                            <v-col
                                cols="12"
                                sm="6"
                            v-if="false">
                                <v-select
                                :items="['0-17', '18-29', '30-54', '54+']"
                                label="Age*"
                                required
                                ></v-select>
                            </v-col>
                            <v-col
                                cols="12"
                                sm="6"
                            v-if="false">
                                <v-autocomplete
                                :items="['Skiing', 'Ice hockey', 'Soccer', 'Basketball', 'Hockey', 'Reading', 'Writing', 'Coding', 'Basejump']"
                                label="Interests"
                                multiple
                                ></v-autocomplete>
                            </v-col>
                        </v-row>
                    </v-container>
                    <small v-if="false">*indicates required field</small>
                    </v-card-text>
                    <!-- <v-card-actions> -->
                        <div class="px-10 pb-5 text-right">
                            <v-btn class="mr-5" variant="tonal" color="grey" @click="dialog = false"> Batal </v-btn>
                            <v-btn class="text-white" color="#5C9527"
                                variant="flat"
                                :disabled="disabled"
                                prepend-icon="mdi-content-save"
                                :loading="loading" text @click="submitForm"> Simpan </v-btn>
                        </div>
                    <!-- </v-card-actions> -->
                </v-form>
            </v-card>
        </v-dialog>
    </v-row>
    </v-card>
</template>