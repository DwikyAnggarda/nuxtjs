<style type="text/css">
    .scroll {
       overflow-y: scroll
    }
</style>
<script setup lang="ts">
    import {
        ref,
        reactive,
        onMounted
    } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { authFetch } from '../../composables/useAuth'
    import moment from 'moment'
    import $ from 'jquery'
    import Datepicker from '@vuepic/vue-datepicker'
    import '@vuepic/vue-datepicker/dist/main.css'

    definePageMeta({
        middleware: ['auth']
    })
    const route = useRoute()
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
    let snackbarText = ref('')
    let formTitle = ref('')
    let formData = ref({})
    let status = ref(null)
    let statusId:any = ref(null)
    let dataPassingGrade = ref({})
    let filteredStatus = ref([
        { name: 'Aktif', id: 1 },
        { name: 'Tidak Aktif', id: 0 },
        { name: 'Semua', id: 2 }
    ])
    let rules = ref({
        nameRules: [
            (v: any) => !!v || 'Program Studi wajib diisi',
            (v: any) => (v && v.length >= 3) || 'Program Studi minimal 3 karakter',
        ],
        scoreRules: [
            (v: any) => !!v || 'Score wajib diisi',
            (v: any) => /(?<=^| )\d+(\.\d+)?(?=$| )/.test(v) || 'Score hanya boleh angka dan gunakan tanda "." untuk mengisi koma, bukan tanda ","'
        ]
    })
    onMounted(() => {
        sessionStorage.path = '/passing-grade/detail'
        getPassingGradeByCode()
        table = createTable(tableRef, {
            ajax: '/passing_grade/detail/'+route.params.code,
            filterBy: [0,1],
            // paramData: function (d:any) {
            //     d.status = statusId.value
            //     // if (!statusId.value) {
            //     // }
            // },
            columns: [
                {
                    data: "name"
                },
                {
                    data: "score"
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

    const getPassingGradeByCode = () => {
        authFetch('/passing_grade/detail/'+route.params.code)
        .then((res) => {
            return res.json()
        })
        .then((js) => {
            dataPassingGrade.value = js.details
        })
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
        formTitle.value = 'Buat Nilai Passing Grade'
        formData.value = {}
        method.value = 'POST'
        dialog.value = true
        disabled.value = false
    }

    const editData = () => {
        formTitle.value = 'Edit Nilai Passing Grade'
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
        // isActive.value = rows[0].active === 1 ? true : false
    }
    
    const deleteData = () => {
        var rows = table.rows('.selected').data()
        if(!rows[0]){
            snackbarText.value = 'Data belum dipilih.'
            snackbar.value = true
            return
        }

        let passing_grade = rows[0]
        authFetch("/passing_grade/detail/" + passing_grade.id, {
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

    const submitForm = async () => {
        const formPassingGradeRef = formPassingGrade.value
        let status = await formPassingGradeRef.validate()

        const payloadData = {
            name: formData.value.name,
            score: formData.value.score
            // active: isActive.value !== false ? 1 : 0
        }

        let data = Object.keys(payloadData).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(payloadData[key])).join("&")

        if (status.valid) {
            disabled.value = true
            let urlSubmit = "/passing_grade/detail/" + route.params.code
            if (method.value == "PUT") urlSubmit = "/passing_grade/detail/" + formData.value.id

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
            <v-col class="mx-9 my-5">
                <h2>{{ dataPassingGrade.name }}</h2>
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
            <v-row class="mb-0">
                <v-col cols="auto">
                    <!-- <v-card width="500" outlined color="transparent">
                        <v-card-item>
                            <v-card-title>{{ dataPassingGrade.name }}</v-card-title>

                            <v-card-subtitle>{{ dataPassingGrade.name }}</v-card-subtitle>
                        </v-card-item>
                    </v-card> -->
                </v-col>
            </v-row>
            <datatable id="tableRef" density="compact" ref="tableRef" :filter="true">
                <thead>
                    <tr>
                        <th class="text-left">
                            PROGRAM STUDI
                        </th>
                        <th class="text-left">
                            NILAI PASSING GRADE
                        </th>
                    </tr>
                </thead>
                <tbody @click="handleClick">
                </tbody>
            </datatable>
        </v-card-text>

        <v-row justify="center">
            <v-dialog v-model="dialog" persistent max-width="600px" scrollable>
                <v-card>
                    <v-form ref="formPassingGrade" v-model="valid" lazy-validation>
                            <v-card-title>
                                <v-btn
                                    @click="dialog = false"
                                    icon="mdi-chevron-left"
                                    size="small"
                                    variant="text"
                                ></v-btn>
                                <span class="text-h5">{{ formTitle }}</span>
                            </v-card-title>
                            <v-card-text>
                                <v-container>
                                    <v-row>
                                        <v-col cols="12">
                                            <v-text-field label="Program Studi" v-model="formData.name" :rules="rules.nameRules" clearable required></v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-text-field label="Nilai Passing Grade" v-model="formData.score" :rules="rules.scoreRules" clearable required></v-text-field>
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