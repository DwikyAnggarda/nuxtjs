<script setup lang="ts">
    import {
        ref,
        reactive,
        onMounted
    } from 'vue'
    import { authFetch } from '../../../composables/useAuth'
    import { useRouter } from 'vue-router'
    import moment from 'moment'
    import Datepicker from '@vuepic/vue-datepicker'
    import '@vuepic/vue-datepicker/dist/main.css'
    import CKEditor from '@ckeditor/ckeditor5-vue'
    import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

    definePageMeta({
        middleware: ['auth']
    })
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
    
    
    
    onMounted(() => {
        sessionStorage.path = '/nilai'
        table = createTable(tableRef, {
            ajax: '/nilai',
            order : [
                [4, 'desc'],
            ],
            columns: [
                {
                    data: "tryout_code"
                },
                {
                    data: "name"
                },
                {
                    data: "kelas"
                },
                {
                    data: "tryout_type",
                    render: function (data, type, row, meta) {
                        var tipe = '';
                        if (data == 82) {
                            tipe = 'TO Akbar'
                        } else {
                            tipe = 'TO Mandiri'
                        }
                        return `<span>`+tipe+`</span>`
                    }
                },
                {
                    data: "created_at",
                    visible: false
                },
                {
                    data: "id",
                    sortable: false,
                    render: function (data, type, row, meta) {
                        // return !data ? '-' : moment(data).format("DD/MM/YYYY")
                        return `<div class="pa-2">
                            <button type="button" style="background-color:#E2F1FD;color:#2196F3" class="text-capitalize v-btn v-btn--elevated v-theme--light v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated detail-tryout-btn" data-code="${row.tryout_code}" data-tipe="${row.tryout_type}">
                                Lihat Nilai
                            </button>
                        </div>`
                    }
                }
            ],
            rowClick: function(evt)
            {
                console.log(evt)
            }
        })
    })

    const handleClick = async (e:any) => {
        if (e.target.matches(".detail-tryout-btn")) {
            if(e.target.dataset.tipe == 82)
            {
                router.push({
                    path : "/nilai/peringkat/"+e.target.dataset.code
                })
            } else {
                router.push({
                    path : "/nilai/user_tryout/"+e.target.dataset.code
                })
            }
            console.log(e.target.dataset.tipe)
        }
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
            <v-card-item>
                <v-card-title class="text-h4" style="line-height: 3rem;">Nilai Tryout Siswa</v-card-title>
            </v-card-item>
        </v-col>
        </v-row>
        <v-card-text class="py-0">
            <datatable density="compact" ref="tableRef" :filter="true">
                <thead>
                    <tr>
                        <th class="text-left">Kode Tryout</th>
                        <th class="text-left">Nama Tryout</th>
                        <th class="text-left">Kelas</th>
                        <th class="text-left">Tipe Tryout</th>
                        <th class="text-left">tanggal</th>
                        <th class="text-left">Action</th>
                    </tr>
                </thead>
                <tbody @click="handleClick">
                </tbody>
            </datatable>
        </v-card-text>
    </v-card>
</template>