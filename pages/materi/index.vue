<script setup lang="ts">
    import {
        ref,
        reactive,
        onMounted
    } from 'vue'
    import { authFetch } from '../../composables/useAuth'
    import { vueRouter } from 'vue-router'
    import Swal from 'sweetalert2'
    import moment from 'moment'
    import Datepicker from '@vuepic/vue-datepicker'
    import '@vuepic/vue-datepicker/dist/main.css'

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
    let rules = ref({
    })
    onMounted(() => {
        sessionStorage.path = '/materi'
        table = createTable(tableRef, {
            ajax: '/materi',
            columns: [
                {
                    data: "code"
                },
                {
                    data: "judul"
                },
                {
                    data: "mapel"
                },
                {
                    data: "kelas"
                },
                {
                    data: "link"
                },
                {
                    data: "status",
                    sortable: false,
                    render: function (data, type, row, meta) {
                        let textColor = data === 1 ? 'green' : 'red'
                        let active_txt = data === 1 ? 'Aktif' : 'Tidak Aktif'

                        return `<span class="v-chip v-theme--light text-${textColor} v-chip--density-default v-chip--size-default v-chip--variant-tonal ma-2 detail-tryout-btn" draggable="false" text-color="white"><span class="v-chip__underlay"></span><i class="mdi-checkbox-blank-circle mdi v-icon notranslate v-theme--light v-icon--size-x-small v-icon--start" aria-hidden="true"></i> ${active_txt} </span>`
                    }
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

    const reloadData = () => {
        table.ajax.reload()
    }

    const addData = () => {
        router.push({
            path : "/materi/tambah"
        })   
    }

    const editData = () => {
        router.push({
            path : "/materi/"+syscode.value
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
            authFetch("/materi/" + banksoal.syscode, {
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
                <v-card-title class="text-h4" style="line-height: 3rem;">Data Materi</v-card-title>
            </v-card-item>
        </v-col>
        <v-col>
            <v-card-actions>
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
                            KODE MATERI
                        </th>
                        <th class="text-left">
                            JUDUL MATERI
                        </th>
                        <th class="text-left">
                            MATA PELAJARAN
                        </th>
                        <th class="text-left">
                            KELAS
                        </th>
                        <th class="text-left">
                            LINK VIDEO
                        </th>
                        <th class="text-left">
                            STATUS
                        </th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </datatable>
        </v-card-text>
    </v-card>
</template>