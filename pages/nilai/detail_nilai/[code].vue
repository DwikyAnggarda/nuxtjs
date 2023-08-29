<script setup lang="ts">
    import {
        ref,
        reactive,
        onMounted
    } from 'vue'
    import { authFetch } from '../../../composables/useAuth'
    import { vueRoute } from 'vue-route'
    import { useRouter } from 'vue-router'
    import moment from 'moment'
    import Datepicker from '@vuepic/vue-datepicker'
    import '@vuepic/vue-datepicker/dist/main.css'
    import CKEditor from '@ckeditor/ckeditor5-vue'
    import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

    definePageMeta({
        middleware: ['auth']
    })
    const route = useRoute()
    const router = useRouter()
    let table = ref(null)
    const tableRef = ref(null)
    const formSubtest = ref(null)
    let method = ref('')
    let disabled = ref(false)
    let valid = ref(true)
    let snackbar = ref(false)
    let snackbarText = ref('')
    let formData = ref({})
    let ro_kode = ref(false)
    let curr_user = ref({})
    let peringkat = ref(null)
    let score = ref(null)
    
    
    onMounted(() => {
        sessionStorage.path = '/nilai/detail_nilai'
        table = createTable(tableRef, {
            ajax: '/nilai/detail_nilai/'+route.query.user_id+'/'+route.params.code,
            order : [
                [4, 'desc'],
            ],
            columns: [
                {
                    data: "code"
                },
                {
                    data: "title"
                },
                {
                    data: "jml_soal"
                },
                {
                    data: "pengerjaan",
                },
                {
                    data: "total_score",
                    render: function (data, type, row, meta) {
                        var a = parseFloat(data)
                        var nilai = a.toFixed(2)
                        return `<span>`+nilai+`</span>`
                    }
                }
            ],
            rowClick: function(evt)
            {
                console.log(evt)
            }
        })

        authFetch('/nilai/detail_nilai/'+route.query.user_id+'/'+route.params.code).then((res) => {
            return res.json()
        }).then((js) => { 
            var a = parseFloat(js.info[0].total_score ? js.info[0].total_score : 0)
            peringkat.value = js.info[0].row_number ? js.info[0].row_number : 0
            score.value = a.toFixed(2)
        })

        authFetch(`/nilai/curr_user/`+route.query.user_id).then((res) => {
            return res.json()
        }).then((js) => { 
            curr_user.value = js[0]
        })
    })

    const handleClick = async (e:any) => {
        console.log(score.value)
    }

    const alertFn = async () => {
        // let daterange = await formData.dates
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
                <v-card-item title="Nilai Tryout Siswa">
                    <template v-slot:subtitle>
                        Daftar Nilai
                    </template>
                </v-card-item>
            </v-col>
        </v-row>
        <v-row style="width: 100%;margin: 0px !important;">
            <v-col cols="12">
               <v-row>
                    <v-col class="d-flex justify-center" cols="12" sm="6" md="4" lg="2">
                        <img :src="curr_user.photo_url" class="mx-3" style="width:100px; height: 100px; object-fit: cover;border-radius: 50%;">
                    </v-col>
                    <v-col cols="12" sm="6" md="4" lg="3" class="pa-4">
                        <v-text-field label="ID Siswa" variant="outlined" style="width: 100%;" readonly v-model="curr_user.code"></v-text-field>
                        <v-text-field label="Nama Siswa" variant="outlined" readonly v-model="curr_user.name"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4" lg="3" class="pa-4">
                        <v-text-field label="Email" variant="outlined" readonly style="width: 100%;" v-model="curr_user.email"></v-text-field>
                        <v-text-field label="Nomor Telepon" variant="outlined" readonly v-model="curr_user.phone"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4" lg="3" class="pa-4">
                        <v-text-field label="Peringkat" variant="outlined" style="width: 100%;" readonly v-model="peringkat"></v-text-field>
                        <v-text-field label="Total Nilai" variant="outlined" readonly v-model="score"></v-text-field>
                    </v-col>
               </v-row> 
            </v-col>
            <v-col cols="12">
                <v-card-text class="py-0">
                    <datatable density="compact" ref="tableRef" >
                        <thead>
                            <tr>
                                <th class="text-left">Kode Subtes</th>
                                <th class="text-left">Subtes</th>
                                <th class="text-left">Jumlah Soal</th>
                                <th class="text-left">Durasi (Menit)</th>
                                <th class="text-left">Nilai</th>
                            </tr>
                        </thead>
                        <tbody @click="handleClick">
                        </tbody>
                    </datatable>
                </v-card-text>
            </v-col>
        </v-row>
    </v-card>
</template>