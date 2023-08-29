<script setup lang="ts">
    import {
        ref,
        reactive,
        onMounted
    } from 'vue'
    import { authFetch } from '../../../composables/useAuth'
    import Chart from 'chart.js/auto';
    import { vueRoute } from 'vue-route'
    import { useRouter } from 'vue-router'
    import moment from 'moment'

    definePageMeta({
        middleware: ['auth']
    })
    const route = useRoute()
    const router = useRouter()
    let table = ref(null)
    const tableRef = ref(null)
    let ro_kode = ref(false)
    let curr_user = ref({})
    let score = ref(null)
    let formTitle= ref('')
    let details = ref([])
    let dialog = ref(false)
    
    
    onMounted(() => {
        sessionStorage.path = '/nilai/user_tryout/detail_siswa'
        table = createTable(tableRef, {
            ajax: '/history_tomandiri_siswa/'+route.query.user_code+'/'+route.query.tryout_code,
            order : [
                [3, 'desc'],
            ],
            columns: [
                {
                    data: "paket_name"
                },
                {
                    data: "tryout_name"
                },
                {
                    data: "total_question",
                    render: function (data, type, row, meta) { 
                        return data ? data : 0
                    }
                },
                {
                    data: "start_at"
                },
                {
                    data: "total_score",
                    render: function (data, type, row, meta) { 
                        return data ? data : 0
                    }
                }
            ],
            rowClick: function(evt)
            {
                console.log(evt)
                formTitle.value = evt.data.tryout_name
                dialog.value = true
                authFetch(`/tryout/detail-history-tryout-user/`+evt.data.id).then((res) => {
                    return res.json()
                }).then((js) => {
                    console.log(js)
                    var datas = []
                    js.data.map(function(item) {
                        var a = {
                            subtes : item.title,
                            code : item.code,
                            duration : item.duration,
                            finished : item.finished,
                            finish_at : item.finish_at,
                            total_question : item.jml_soal,
                            durasi_pengerjaan : item.pengerjaan,
                            total_correct : item.total_correct,
                            total_score : item.total_score,
                            uuid : item.uuid,
                            category_name : item.category_name
                        }
                        datas.push(a)
                    })
                    details.value = datas
                })
            }
        })

        var labels_chart = [];
        var nilai = [];

        var payloadData = {
            'user_id' : route.query.user_code,
            'tipe' : 51,
            'paket' : null,
            'tryout' : route.query.tryout_code,
            'tanggal' : null
        }

        let data = Object.keys(payloadData).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(payloadData[key])).join("&")
        authFetch(`/summary_siswa/detail_chart?`+data).then((res) => {
          return res.json()
        }).then((js) => {
            console.log('test',js)
            js.data.map(function(item){
                labels_chart.push(item.tanggal)
                nilai.push(item.mandiri)
            })
             const dataTrafficUser = reactive({
                      type: 'line',
                      data: {
                          labels: labels_chart,
                          datasets: [ 
                                        {   data: nilai,
                                            label: 'Nilai Siswa',
                                            borderColor: 'green',
                                            backgroundColor: 'green',
                                        },
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

        authFetch(`/nilai/curr_user/`+route.query.user_code).then((res) => {
            return res.json()
        }).then((js) => { 
            curr_user.value = js[0]
        })

        authFetch('/history_tomandiri_siswa/'+route.query.user_code+'/'+route.query.tryout_code).then((res) => {
            return res.json()
        }).then((js) => { 
            var a = parseFloat(js.rata_nilai ? js.rata_nilai : 0)
            score.value = a.toFixed(2)
        })
        console.log(route.query)
    })

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
                        <v-text-field label="Rata-rata Nilai" variant="outlined" readonly v-model="score"></v-text-field>
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
        <v-row>
            <v-dialog v-model="dialog" persistent max-width="1000px">
                <v-card>
                    <!-- <v-card-title>
                        
                    </v-card-title> -->
                    <v-card-text>
                        <v-row>
                            <v-col cols="12">
                                <div class="d-flex align-center">
                                    <span class="text-h5 mx-2"> {{ formTitle }} </span>
                                </div>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12">
                                <v-table>
                                    <thead>
                                      <tr>
                                        <th class="text-left">
                                          SUBTES
                                        </th>
                                        <th class="text-left">
                                          KELAS
                                        </th>
                                        <th class="text-left">
                                          JUMLAH SOAL
                                        </th>
                                        <th class="text-left">
                                          DURASI SUBTES (MENIT)
                                        </th>
                                        <th class="text-left">
                                          DURASI PENGERJAAN (MENIT)
                                        </th>
                                        <th class="text-left">
                                          JAWABAN BENAR
                                        </th>
                                        <th class="text-left">
                                          NILAI
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr
                                        v-for="item in details"
                                        :key="item.subtes"
                                      >
                                        <td>{{ item.subtes }}</td>
                                        <td>{{ item.code }}</td>
                                        <td>{{ item.total_question }}</td>
                                        <td>{{ item.duration }}</td>
                                        <td>{{ item.durasi_pengerjaan }}</td>
                                        <td>({{ item.total_correct }} / {{ item.total_question }})</td>
                                        <td>{{ parseFloat(item.total_score).toFixed() }}</td>
                                      </tr>
                                    </tbody>
                                </v-table>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" text @click="dialog = false"> Close </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
    </v-card>
</template>