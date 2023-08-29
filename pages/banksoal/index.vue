<script setup lang="ts">
    import {
        ref,
        reactive,
        onMounted
    } from 'vue'
    import { authFetch } from '../../composables/useAuth'
    import { vueRouter } from 'vue-router'
    import moment from 'moment'
    import Swal from 'sweetalert2'
    import Datepicker from '@vuepic/vue-datepicker'
    import '@vuepic/vue-datepicker/dist/main.css'
    import CKEditor from '@ckeditor/ckeditor5-vue'
    import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

    definePageMeta({
        middleware: ['auth']
    })
    let table = ref(null)
    const router = useRouter()
    const tableRef = ref(null)
    const formSubtest = ref(null)
    let method = ref('')
    let disabled = ref(false)
    let dialog = ref(false)
    let valid = ref(true)
    let snackbar = ref(false)
    let snackbarText = ref('')
    let syscode = ref('')
    let formTitle = ref('')
    let formData = ref({})
    let kelas = ref(null)
    let kelasId = ref(0)
    let mapel = ref(null)
    let mapelId = ref(0)
    let filteredKelas = ref([])
    let filteredMapel = ref([])
    let filteredStatus = ref([
        { name: 'Aktif', id: 1 },
        { name: 'Tidak Aktif', id: 0 },
        { name: 'Semua', id: 2 }
    ])
    let rules = ref({
    })
    onMounted(() => {
        sessionStorage.path = '/banksoal'
        getKelas()
        getMapel()
        table = createTable(tableRef, {
            ajax: '/banksoal',
            filterBy: [1],
            order : [
                [4, 'desc'],
            ],
            paramData: function (d:any) {
                d.kelas_id = kelasId.value
                d.mapel_id = mapelId.value
            },
            columns: [
                {
                    data: "code"
                },
                {
                    data: "question"
                },
                {
                    data: "kelas"
                },
                {
                    data: "mapel"
                },
                {
                    data:"created_at",
                    visible:false
                }
            ],
            rowClick: function(evt)
            {
                console.log(evt)
                syscode.value = evt.data.syscode
                console.log(syscode.value)
            }
        })
        // this.$emit('ready')
    })

    /* Methods */
    const getKelas = () => {
        authFetch('/kelas')
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                js.data.map((item:any) => {
                    let obj = {}
                    obj = {
                        name: item.name,
                        id: item.id
                    }

                    filteredKelas.value.push(obj)
                })

                var obj2 = {
                    name: 'Semua',
                    id: 0
                }

                filteredKelas.value.push(obj2);
            });
    }

    const getMapel = () => {
        authFetch('/mapel')
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                js.data.map((item:any) => {
                    let obj = {}
                    obj = {
                        name: item.name,
                        id: item.id
                    }

                    filteredMapel.value.push(obj)
                })

                var obj2 = {
                    name: 'Semua',
                    id: 0
                }

                filteredMapel.value.push(obj2);
            });
    }

    const onChangedFilterKelas = (val:any) => {
        kelasId.value = kelas.value.id
        reloadData()
    }

    const onChangedFilterMapel = (val:any) => {
        mapelId.value = mapel.value.id
        reloadData()
    }

    const importdata = () => {
        router.push({
            path : "/banksoal/import"
        })
    }

    /* CRUD Methods */
    const reloadData = () => {
        table.ajax.reload()
    }

    const addData = () => {
        router.push({
            path : "/banksoal/tambah"
        })   
    }

    const editData = () => {
        router.push({
            path : "/banksoal/"+syscode.value
        })
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
          text: 'Hapus Data '+rows[0].code,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Oke',
          cancelButtonText: 'Batal',
        }).then((result) => {
          if (result.isConfirmed) {
            let banksoal = rows[0]
            authFetch("/banksoal/" + banksoal.syscode, {
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
                <v-card-title class="text-h4" style="line-height: 3rem;">Data Bank Soal</v-card-title>
            </v-card-item>
        </v-col>
        <v-col>
            <v-card-actions>
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
            <v-row justify="end">
                <!-- <v-col md="3" sm="6">
                    <v-btn size="x-large" style="height: 56px !important; background-color: rgb(110, 138, 61); color:white;" @click="importdata" variant="tonal">Import</v-btn>
                </v-col>
                <v-spacer></v-spacer> -->
                <v-col md="3" sm="6">
                    <v-select
                        v-model="mapel"
                        :items="filteredMapel"
                        @update:modelValue="onChangedFilterMapel"
                        item-title="name"
                        item-value="id"
                        label="Mapel"
                        variant="solo"
                        return-object
                        single-line
                    ></v-select>
                </v-col>
                <v-col md="3" sm="6">
                    <v-select
                        v-model="kelas"
                        :items="filteredKelas"
                        @update:modelValue="onChangedFilterKelas"
                        item-title="name"
                        item-value="id"
                        label="Kelas"
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
                            Kode Soal
                        </th>
                        <th class="text-left">
                            Soal
                        </th>
                        <th class="text-left">
                            Kelas
                        </th>
                        <th class="text-left">
                            Mata Perlajaran
                        </th>
                        <th class="text-left">
                            Created at
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
                <v-form ref="formSubtest" v-model="valid" lazy-validation>
                    <v-card-title>
                        <span class="text-h5"> {{ formTitle }} </span>
                    </v-card-title>
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field label="Judul" v-model="formData.title" :rules="rules.titleRules" clearable required></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field v-model="formData.duration" :rules="rules.durationRules" label="Durasi (Menit)" type="number" clearable required></v-text-field>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" text @click="dialog = false"> Close </v-btn>
                        <v-btn color="blue darken-1" text @click="submitForm" :disabled="disabled"> Save </v-btn>
                    </v-card-actions>
                </v-form>
            </v-card>
        </v-dialog>
    </v-row>
    </v-card>
</template>