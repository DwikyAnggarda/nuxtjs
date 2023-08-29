<style type="text/css">
	.vcard{
		background-color: #5C9527;
		color: white;
	}
	.img-user{
		border-radius:50%; 
		vertical-align: middle;
		width: 50px;
		height: 50px;
		object-fit:cover;
	}
</style>
<script setup lang="ts">
	import {
        ref,
        reactive,
        onMounted,
        computed
    } from 'vue'

    import { Calendar, DatePicker } from 'v-calendar';
	import 'v-calendar/style.css';
	import moment from 'moment/min/moment-with-locales'
    import Chart from 'chart.js/auto';
    import $ from 'jquery';
	import TrendChart from "vue-trend-chart";
	definePageMeta({
		middleware: ['auth']
	})
	let table = ref(null)
	const tableRef = ref(null)
	const formSubtest = ref(null)
	const formPaket = ref(null)
	let method:any = ref('')
	let snackbar = ref(false)
    let snackbarText = ref('')
    let valid = ref(true)
	let dialog = ref(false)
	let formData = ref({})
	let jml_user = ref('')
	let jml_course = ref('')
	let jml_payment = ref('')
	let total_payment = ref('')
	let jml_soal = ref('')
	let jml_subtes = ref('')
	let jml_tryout = ref('')
	let jml_paket = ref('')
	let jml_materi = ref('')
	let agenda = ('')
	let disabled = ref(false)
	let loading = ref(false)
	let date = ref(new Date());
	let calendar = ref(null);
	let paket_terlaris = ref([])
	// let selectAttribute = ref({ dot: true });
	let attributes = ref([
			// {
			//     // key: 'today',
			//     dot: true,
			//     dates: '2023-03-29',
			//     popover: {
			//       label: 'meeting'
			//     }
			// },
			// {
			//     // key: 'today',
			//     dot: true,
			//     dates: '2023-03-30',
			//     popover: {
			//       label: 'test'
			//     }
			// }
		])
	
	onMounted(() => {
        sessionStorage.path = '/dashboard_rcu'
		var labels_chart = [];
		var data_active = [];
		authFetch(`/data_chart_rcu/training`).then((res) => {
          return res.json()
      }).then((js) => {
          js.map(function(item){
          	labels_chart.push(item.tanggal)
          	data_active.push(item.active)
          })
         const dataTrafficUser = reactive({
				  type: 'line',
			     data: {
				      labels: labels_chart,
				      datasets: [ {  data: data_active,
                                    label: 'Terdaftar',
                                    borderColor: 'green',
                                    backgroundColor: 'green',
                                    cubicInterpolationMode: 'monotone',
                                    tension: 0.4,
                                    spanGaps: true,
				      				}],
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

      authFetch(`/info_dashboard_rcu/training`).then((res) => {
      	return res.json()
      }).then((js) => {
      	paket_terlaris.value = js.paket_terlaris
      	jml_user.value = js.jml_user
      	jml_course.value = js.jml_course
      	jml_payment.value = js.jml_payment
      	total_payment.value = currency(js.total_payment)
      	jml_soal.value = js.jml_soal
      	jml_subtes.value = js.jml_subtes
      	jml_tryout.value = js.jml_tryout
      	jml_paket.value = js.jml_paket
      	jml_materi.value = js.jml_materi
      	var agendas = []
      	if(js.agenda) {
	      	js.agenda.map(function(item){
	      		if(item.tipe == "TO")
	      		{
	      			var a = {
					    highlight: 'green',
					    dates: { start: item.tanggal, end: item.tanggal_selesai },
					    popover: {
					      label: item.name
					    }
					}
					agendas.push(a)
	      		} else {
		      		var a = {
					    bar:  '#2196F3',
					    dates: item.tanggal,
					    popover: {
					      label: item.name+' ('+item.jam+' WIB)'
					    }
					}
					agendas.push(a)
	      		}
	      	})
	      	attributes.value = agendas	
      	}
      })

      const currency = (value) => {
         let val = (value/1).toFixed(2).replace('.', ',')
         return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      }

		table = createTable(tableRef, {
            ajax: '/payment/training',
            filterBy: [0,2,3],
            order : [
                [3, 'desc']
            ],
            columns: [
                { data: "user_name",
                	render: function(data,type,row,meta) {
                		return `
                			<div class="d-flex flex-row pa-2 align-center">
                				<div class="mr-3">
								   <img ref="previewImg" class="img-user" src="` + row.photo_url + `" alt="profile photo"/>
								</div>
								<div class"d-flex flex-column">
								   <span>`+row.user_name+`</span>
								   <br>
								   <span>`+row.sekolah+`</span>
								</div>
							</div>
                		`
                	}
                },
                { data: "paket_name" },
                { data: "amount",
                  render: function (data, type, row, meta) {
                    return `<span>Rp. `+currency(row.amount)+`</span>`
                  } 
                },
                { data: "updated_at",
                render: function (data, type, row, meta) {
                    return !data ? '-' : moment(data).format('DD MMMM YYYY, HH:mm')
                } },
                {
                    data: "payment_status",
                    sortable: false,
                    render: function (data, type, row, meta) {
                        // return !data ? '-' : moment(data).format("DD/MM/YYYY")
                        if (row.payment_status == 1){
                            return `
                            <div class="text-center pa-2">
                                <button type="button" style="width:95%;background-color:#FFE6C7;color:#666666" class="v-btn text-capitalize v-btn--elevated v-theme--light v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated detail-pembayaran-btn" data-code="${row.code}"><i class="mdi-checkbox-blank-circle mdi v-icon notranslate v-theme--light v-icon--size-x-small v-icon--start" aria-hidden="true" style="color: #FB8C00"></i>Menunggu Konfirmasi
                                </button>
                            </div>`
                        } else if (row.payment_status == 2) {
                            return `
                            <div class="text-center pa-2">
                                <button type="button" style="width:95%;background-color: #D8EED9;color:#666666" class="v-btn text-capitalize v-btn--elevated v-theme--light v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated detail-pembayaran-btn" data-code="${row.code}"><i class="mdi-checkbox-blank-circle mdi v-icon notranslate v-theme--light v-icon--size-x-small v-icon--start" aria-hidden="true" style="color: #4CAF50"></i>Pembayaran Berhasil
                                </button>
                            </div>`
                        } else if (row.payment_status == 3) {
                            return `
                            <div class="text-center pa-2">
                                <button type="button" style="width:95%;background-color: #FFEBEB;color:#666666" class="v-btn text-capitalize v-btn--elevated v-theme--light v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated detail-pembayaran-btn" data-code="${row.code}"><i class="mdi-checkbox-blank-circle mdi v-icon notranslate v-theme--light v-icon--size-x-small v-icon--start" aria-hidden="true" style="color: #FF5252"></i>Pembayaran Gagal
                                </button>
                            </div>`
                        } else {
                            return `
                            <div class="text-center pa-2">
                                <button type="button" style="width:95%;background-color:#E2F1FD;color:#666666" class="v-btn text-capitalize v-btn--elevated v-theme--light v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated detail-pembayaran-btn" data-code="${row.code}"><i class="mdi-checkbox-blank-circle mdi v-icon notranslate v-theme--light v-icon--size-x-small v-icon--start" aria-hidden="true" style="color: #2196F3"></i>Menunggu Pembayaran
                                </button>
                            </div>`
                        }
                    }
                },
            ],
            selectedRowClass:'',
            rowClick: function(evt)
            {
                console.log(evt)
            },
            rowCallback(row, data)
            {
                // $("td:eq(5)", row).html(getPaymentStatus(data.payment_status, data.code));
            }
        })
  })

    const tambahAgenda = () => {
        dialog.value = true
        method.value = 'POST'
    }

    const submitAgenda = async () => {
    	// console.log(date.value)
    	const formPaketRef = formPaket.value
        let status = await formPaketRef.validate()

    	function convert(str) {
		  var date = new Date(str),
		    mnth = ("0" + (date.getMonth() + 1)).slice(-2),
		    day = ("0" + date.getDate()).slice(-2);
		  return [date.getFullYear(), mnth, day].join("-");
		}
		var tanggal = new Date(date.value);

		const hours = tanggal.getHours(); // returns the hour (0-23)
		const minutes = tanggal.getMinutes(); // returns the minute (0-59)
		const seconds = tanggal.getSeconds();
		formData.value.tanggal_agenda = convert(date.value)+' '+hours+':'+minutes+':'+seconds

		console.log(formData.value)

		// let data = Object.keys(formData.value).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(formData.value[key])).join("&")

        // if (status.valid) {
        // 	loading.value = true
        //     disabled.value = true
        //     let urlSubmit = "/agenda"
        //     if (method.value == "PUT") urlSubmit = "/agenda/" + formData.value.id

        //     authFetch(urlSubmit, {
        //         method: method.value,
        //         body: data,
        //     })
        //     .then((res) => {
        //         if (res.status === 201) {
        //         } else if (res.status === 400) {
        //         }
        //         return res.json()
        //         })
        //     .then((js) => {
        //     	loading.value = false
        //         disabled.value = false
        //         let errors = []
        //         if (!js.success) {
        //             // console.log(js.details)
        //             for (var key in js.details) {
        //                 if (js.details.hasOwnProperty(key)) {
        //                     console.log(errors.push(js.details[key]))
        //                 }
        //             }

        //             return;
        //         }
        //         window.location.reload()
        //         table.ajax.reload()
        //         dialog.value = false
        //         snackbarText.value = js.message
        //         snackbar.value = true
        //     })
        // }
    }

</script>
<template>
		<v-row>
			<v-col sm="6" md="3" lg="3">
				<v-card class="vcard" style="border-radius:10px; padding:9px">
					<v-card-title style="word-break: break-word" class="font-weight-bold">
						TOTAL USERS
					</v-card-title>
					<v-card-text>
						<v-row class="mt-1">
							<v-col cols="6" class="d-flex justify-start align-center">
								<span
									style="font-weight: bold; font-size: x-large;">{{ jml_user }}</span>
							</v-col>
							<v-col cols="6" style="padding:6px; padding-top:3px">
								<div class="d-flex justify-end">
									<img src="/images/background/user.png" style="width: 30% !important;">
								</div>
							</v-col>
						</v-row>
						<!-- <div class="d-flex">
		    			<span class="d-flex justify-start align-center" style="font-weight: bold; font-size: x-large;">{{ jml_user }}</span>	
			    		<span class="d-flex justify-end" style="width: 100%">
			    			<img  src="/images/background/user.png" style="width: 30% !important;">
			    		</span>
			    	</div> -->
					</v-card-text>
				</v-card>
			</v-col>
			<v-col sm="6" md="3" lg="3">
				<v-card class="vcard" style="border-radius:10px; padding:9px">
					<v-card-title style="word-break: break-word" class="font-weight-bold">
						TOTAL COURSE
					</v-card-title>
					<v-card-text>
						<v-row class="mt-1">
							<v-col cols="6" class="d-flex justify-start align-center">
								<span
									style="font-weight: bold; font-size: x-large;">{{ jml_course }}</span>
							</v-col>
							<v-col cols="6" style="padding:6px; padding-top:3px">
								<div class="d-flex justify-end">
									<img src="/images/background/sticker.png" style="width: 30% !important;">
								</div>
							</v-col>
						</v-row>
						<!-- <div class="d-flex">
		    			<span class="d-flex justify-start align-center" style="font-weight: bold; font-size: x-large;">{{ jml_course }}</span>	
			    		<span class="d-flex justify-end" style="width: 100%">
			    			<img  src="/images/background/sticker.png" style="width: 30% !important;">
			    		</span>
			    	</div> -->
					</v-card-text>
				</v-card>
			</v-col>
			<v-col sm="6" md="3" lg="3">
				<v-card class="vcard" style="border-radius:10px; padding:9px">
					<v-card-title style="word-break: break-word" class="font-weight-bold">
						TOTAL PEMBELIAN
					</v-card-title>
					<v-card-text>
						<v-row class="mt-1">
							<v-col cols="6" class="d-flex justify-start align-center">
								<span
									style="font-weight: bold; font-size: x-large;">{{ jml_payment }}</span>
							</v-col>
							<v-col cols="6" style="padding:6px; padding-top:3px">
								<div class="d-flex justify-end">
									<img src="/images/background/basket.png" style="width: 30% !important;">
								</div>
							</v-col>
						</v-row>
						<!-- <div class="d-flex">
		    			<span class="d-flex justify-start align-center" style="font-weight: bold; font-size: x-large;">{{ jml_payment }}</span>	
			    		<span class="d-flex justify-end" style="width: 100%">
			    			<img  src="/images/background/basket.png" style="width: 30% !important;">
			    		</span>
			    	</div> -->
					</v-card-text>
				</v-card>
			</v-col>
			<v-col sm="6" md="3" lg="3">
				<v-card class="vcard" style="border-radius:10px; padding:9px">
					<v-card-title style="word-break: break-word" class="font-weight-bold">
						TOTAL PENJUALAN
					</v-card-title>
					<v-card-text>
						<v-row class="mt-1">
							<v-col cols="6" class="d-flex justify-start align-center">
								<div
									style="font-weight: bold; font-size: x-large;">
									<span>{{ total_payment }}</span>
								</div>
							</v-col>
							<v-col cols="6" style="padding:6px; padding-top:3px">
								<div class="d-flex justify-end">
									<img src="/images/background/credit-card.png" style="width: 30% !important;">
								</div>
							</v-col>
						</v-row>
						<!-- <div class="d-flex">
		    			<span class="d-flex justify-start align-center" style="font-weight: bold; font-size: x-large;">{{ total_payment }}</span>	
			    		<span class="d-flex justify-end" style="width: 100%">
			    			<img  src="/images/background/credit-card.png" style="width: 30% !important;">
			    		</span>
			    	</div> -->
					</v-card-text>
				</v-card>
			</v-col>

			<v-col cols="12">
				<v-card class="mx-auto">
			        <v-row>
			            <v-col>
						      <v-card-item>
						      	<v-card-title style="font-weight: var(--vc-font-semibold);">
						      		Users RCU Education
						      	</v-card-title>	
						      </v-card-item>
					       </v-col>
			        </v-row>
			        <v-card-text class="py-0">
			        	<canvas ref="chartbatang" id="siswa-chart" height="200" style="display: block; width: 487px; height: 200px;" width="487" class="chartjs-render-monitor"></canvas>
			        </v-card-text>
			   </v-card>
			</v-col>

			<v-col sm="12" md="8">
				<v-card class="mx-auto">
					<v-card-item title="Pembayaran">
			            <template v-slot:subtitle>
			                Pembayaran Terbaru RCU Education
			            </template>
			        </v-card-item>
		        	<v-card-text class="py-0">
			            <datatable density="compact" ref="tableRef">
			                <thead>
			                    <tr>
		                        <th class="text-left">
		                            USER
		                        </th>
		                        <th class="text-left">
		                            PAKET
		                        </th>
		                        <th class="text-left">
		                            HARGA
		                        </th>
		                        <th class="text-left">
		                            TANGGAL
		                        </th>
		                        <th class="text-left">
		                            STATUS PEMBAYARAN
		                        </th>
		                    </tr>
			                </thead>
			                <tbody>
			                </tbody>
			            </datatable>
	        		</v-card-text>
				</v-card>
			</v-col>

			<v-col sm="12" md="4">
				<v-card class="mx-auto my-5">
						<v-card-item title="Paket Terlaris"></v-card-item>
						<v-card-text>
							<div style="width: auto;" v-if="paket_terlaris[0]">
								<v-row>
									<v-col cols="6">
										<p>{{ paket_terlaris[0].nama_paket }}</p>
									</v-col>
									<v-col cols="6">
										<div class="d-flex justify-end">
											<span>{{ paket_terlaris[0].jumlah }}</span>
										</div>
									</v-col>
								</v-row>
							</div>
							<v-progress-linear v-if="paket_terlaris[0]" :model-value="paket_terlaris[0].jumlah" color="#4caf50" rounded></v-progress-linear>
							<br>
							<div style="width: auto;" v-if="paket_terlaris[1]">
								<v-row>
									<v-col cols="6">
										<p>{{ paket_terlaris[1].nama_paket }}</p>
									</v-col>
									<v-col cols="6">
										<div class="d-flex justify-end">
											<span>{{ paket_terlaris[1].jumlah }}</span>
										</div>
									</v-col>
								</v-row>
							</div>
							<v-progress-linear v-if="paket_terlaris[1]" :model-value="paket_terlaris[1].jumlah" color="#4caf50" rounded></v-progress-linear>
							<br>
							<div style="width: auto;" v-if="paket_terlaris[2]">
								<v-row>
									<v-col cols="6">
										<p>{{ paket_terlaris[2].nama_paket }}</p>
									</v-col>
									<v-col cols="6">
										<div class="d-flex justify-end">
											<span>{{ paket_terlaris[2].jumlah }}</span>
										</div>
									</v-col>
								</v-row>
							</div>
							<v-progress-linear v-if="paket_terlaris[2]" :model-value="paket_terlaris[2].jumlah" color="#4caf50" rounded></v-progress-linear>
							<br>
							<div style="width: auto;" v-if="paket_terlaris[3]">
								<v-row>
									<v-col cols="6">
										<p>{{ paket_terlaris[3].nama_paket }}</p>
									</v-col>
									<v-col cols="6">
										<div class="d-flex justify-end">
											<span>{{ paket_terlaris[3].jumlah }}</span>
										</div>
									</v-col>
								</v-row>
							</div>
							<v-progress-linear v-if="paket_terlaris[3]" :model-value="paket_terlaris[3].jumlah" color="#4caf50" rounded></v-progress-linear>
							<br>
							<div style="width: auto;" v-if="paket_terlaris[4]">
								<v-row>
									<v-col cols="6">
										<p>{{ paket_terlaris[4].nama_paket }}</p>
									</v-col>
									<v-col cols="6">
										<div class="d-flex justify-end">
											<span>{{ paket_terlaris[4].jumlah }}</span>
										</div>
									</v-col>
								</v-row>
							</div>
							<v-progress-linear v-if="paket_terlaris[4]" :model-value="paket_terlaris[4].jumlah" color="#4caf50" rounded></v-progress-linear>
						</v-card-text>
					</v-card>
			</v-col>
		</v-row>
		<v-row>
			<v-dialog v-model="dialog" persistent max-width="600px" scrollable>
                <v-card>
                    <v-form v-on:submit.prevent ref="formPaket" v-model="valid" lazy-validation>
                            <v-card-title>
                            <span class="text-h5"> Form Tambah Agenda </span>
                            </v-card-title>
                            <v-card-text>
                                <v-container>
                                    <v-row>
                                        <v-col md="12" sm="12" xs="12">
                                        	<DatePicker expanded :attributes="attributes" v-model="date" mode="dateTime" />                                     
                                        </v-col>
                                        <v-col md="12" sm="12" xs="12">
                                            <v-text-field v-model="formData.agenda" label="Nama Agenda" clearable required></v-text-field>
                                        </v-col>
                                        <v-divider></v-divider>                                        
                                    </v-row>
                                </v-container>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue darken-1" text @click="dialog = false"> Close </v-btn>
                                <v-btn color="blue darken-1" text @click="submitAgenda" :loading="loading" :disabled="disabled"> Save </v-btn>
                            </v-card-actions>
                    </v-form>
                </v-card>
            </v-dialog>
		</v-row>
	</template>
