<script setup lang="ts">
    import {
        ref,
        reactive,
        onMounted
    } from 'vue'
    import { authFetch } from '../../composables/useAuth'
    import Chart from 'chart.js/auto';
    import { vueRoute } from 'vue-route'
    import { useRouter } from 'vue-router'
    import moment from 'moment'
    import Swal from 'sweetalert2'
    import Datepicker from '@vuepic/vue-datepicker'
    import '@vuepic/vue-datepicker/dist/main.css'
    import CKEditor from '@ckeditor/ckeditor5-vue'
    import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
    import { tsXLXS } from 'ts-xlsx-export';

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
    let score = ref(null)
    
    
    onMounted(() => {
        sessionStorage.path = '/summary_siswa/detail'
        table = createTable(tableRef, {
            ajax: '/summary_siswa/detail/'+route.params.code,
            order : [
                [4, 'desc'],
            ],
            columns: [
                {
                    data: "paket_name",
                    sortable:false
                },
                {
                    data: "tryout_name",
                    sortable:false,
                },
                {
                    data: "tryout_type",
                    sortable:false,
                    render: function (data, type, row, meta) { 
                        var tipe = ''
                        if (data == 82) {
                            tipe = 'Tryout Akbar'
                        } else {
                            tipe = 'Tryout Mandiri'
                        }
                        return `<span>`+tipe+`</span>`
                    }
                },
                {
                    data: "total_question",
                    sortable:false,
                    render: function (data, type, row, meta) { 
                        return data ? data : 0
                    }
                },
                {
                    data: "start_at",
                    sortable:false,
                },
                {
                    data: "total_score",
                    sortable:false,
                    render: function (data, type, row, meta) { 
                        return data ? parseFloat(data).toFixed(2) : 0
                    }
                }
            ],
            rowClick: function(evt)
            {
                console.log(evt)
                // router.push({
                //     path : "/nilai/peringkat/"+evt.data.tryout_code
                // })
            }
        })

        var labels_chart = [];
        var mandiri = [];
        var akbar = [];

        var payloadData = {
            'user_id' : route.params.code,
            'tipe' : null,
            'paket' : null,
            'tryout' : null,
            'tanggal' : null
        }

        let data = Object.keys(payloadData).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(payloadData[key])).join("&")
        authFetch(`/summary_siswa/detail_chart?`+data).then((res) => {
          return res.json()
        }).then((js) => {
            console.log('test',js)
            js.data.map(function(item){
                console.log(item)
                labels_chart.push(item.tanggal)
                var nilai_akbar = item.akbar >= 0 ? parseFloat(item.akbar).toFixed(2) : ''
                akbar.push(nilai_akbar)
                var nilai_mandiri = item.mandiri >= 0 ? parseFloat(item.mandiri).toFixed(2) : ''
                mandiri.push(nilai_mandiri)
            })
             const dataTrafficUser = reactive({
                      type: 'line',
                      data: {
                          labels: labels_chart,
                          datasets: [ 
                                        {   data: mandiri,
                                            label: 'Mandiri',
                                            borderColor: 'orange',
                                            backgroundColor: 'orange',
                                            spanGaps: true,
                                        },
                                        {   data: akbar,
                                            label: 'Akbar',
                                            borderColor: 'green',
                                            backgroundColor: 'green',
                                            spanGaps: true,
                                        }
                                    ]
                       },
                     options: {
                         responsive: true,
                         maintainAspectRatio: true,
                         legend: {
                             position: 'top',
                             display: false
                         },
                         title: {
                             display: true,
                             text:'test'
                         },
                         scales: {
                            y: {
                                min: 0
                            }
                         }
                     }
                })

            var ctx = document.getElementById('siswa-chart').getContext('2d')
            var chartSiswa = new Chart(ctx, dataTrafficUser);
            chartSiswa.update()
        })

        authFetch(`/nilai/curr_user/`+route.params.code).then((res) => {
            return res.json()
        }).then((js) => { 
            curr_user.value = js[0]
        })

        authFetch(`/summary_siswa/detail/`+route.params.code).then((res) => {
            return res.json()
        }).then((js) => { 
            var a = parseFloat(js.rata_nilai ? js.rata_nilai : 0)
            score.value = a.toFixed(2)
        })
    })

    const exportToXlsx = () => {
        authFetch(`/summary_siswa/download/`+route.params.code).then((res) => {
          return res.json()
        }).then((js) => {
            if ( js.data.length > 0)
            {
                var a = [];
                function renameKeys(obj, newKeys) {
                  const keyValues = Object.keys(obj).map(key => {
                    const newKey = newKeys[key] || key;
                    return { [newKey]: obj[key] };
                  });
                  return Object.assign({}, ...keyValues);
                }
                js.data.map(function(item){
                    const obj = item;
                    const newKeys = { paket_name: "Nama Paket", tryout_name: "Nama Tryout", case:"Tipe Tryout", total_question: "Jumlah Soal", start_at: "Tanggal Pengerjaan", total_score: "Nilai" };
                    const renamedObj = renameKeys(obj, newKeys);
                    a.push(renamedObj)
                })
                var title = 'Rekap Nilai '+js.user.name
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
                <v-card-item title="Detail Siswa">
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
                        <v-text-field label="Rata-rata Nilai" variant="outlined" readonly v-model="score"></v-text-field>
                        <v-btn @click="exportToXlsx" block color="#6E8A3D" class="text-white" style="height: 56px;">
                          Download Nilai
                        </v-btn>
                    </v-col>
               </v-row> 
            </v-col>
            <v-col cols="12">
                <v-card-text class="py-0">
                    <span class="font-weight-bold">Nilai Tryout</span>                    
                    <datatable density="compact" ref="tableRef" >
                        <thead>
                            <tr>
                                <th class="text-left">Nama Paket</th>
                                <th class="text-left">Nama Tryout</th>
                                <th class="text-left">Tipe Tryout</th>
                                <th class="text-left">Jumlah Soal</th>
                                <th class="text-left">Tanggal Pengerjaan</th>
                                <th class="text-left">Nilai</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </datatable>
                </v-card-text>
            </v-col>
            <v-col cols="12">
                <v-card-text class="py-0">
                    <span class="font-weight-bold">Grafik Nilai Siswa</span>
                    <canvas ref="chartbatang" id="siswa-chart" height="200" style="display: block; width: 487px; height: 200px;" width="487" class="chartjs-render-monitor"></canvas>
                </v-card-text>
            </v-col>
        </v-row>
    </v-card>
</template>