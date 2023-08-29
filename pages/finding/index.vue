<script setup lang="ts">
    import {
        ref,
        onMounted
    } from 'vue'
    import $ from 'jquery';
    import { authFetch,useUser } from '../../composables/useAuth'
    import { useRouter } from 'vue-router'
    import moment from 'moment/min/moment-with-locales'
    import Datepicker from '@vuepic/vue-datepicker'
    import '@vuepic/vue-datepicker/dist/main.css'
    import { tsXLXS } from 'ts-xlsx-export';
    import Swal from 'sweetalert2'
    import { getToken } from "firebase/messaging"

    definePageMeta({
        middleware: ['auth']
    })
    const router = useRouter()
    const user = await useUser()
    const nuxtApp = useNuxtApp()
    const config = useRuntimeConfig()
    let table = ref(null)
    let tableRef = ref(null)
    let isSuperUser = ref(false)
    let snackbar = ref(false)
    let snackbarText = ref('')
    let valid = ref(true)
    let rowId = ref(0)
    let status = ref(null)
    let statusId:any = ref(null)
    onMounted(() => {

        if(user.role == 'superuser') {
            isSuperUser.value = true
        }
        moment.locale('id')

        getToken(nuxtApp.$messaging, { vapidKey: config.FB_VAPIDKEY }).then((currentToken) => {
		if (currentToken) {
			if(localStorage.NTOKENKEY != currentToken)
			{
				localStorage.NTOKENKEY = currentToken;
				authFetch('/users/webpush', {
					method: 'POST',
					body: 'token='+currentToken,
				})
				.then((res) => {
					if (res.status === 201) {
					} else if (res.status === 400) {
					}
					return res.json()
					})
				.then((js) => {
					console.log('save token')
				})
			}	
		} else {
			// Show permission request UI
			console.log('No registration token available. Request permission to generate one.');
		}
		}).catch((err) => {
			console.log('An error occurred while retrieving token. ', err);
		});

        table = createTable(tableRef, {
            ajax: '/finding',
            filterBy: [0,1,2],
            order: [
				[4, 'desc']
			],
            paramData: function (d:any) {
                d.status = statusId.value
            },
            columns: [
                {
                    data: "title"
                },
                {
                    data: "note",
                    render: function (data, type, row, meta) {
                        return !data ? '-' : data
                    }
                },
                {
                    data: "latitude"
                },
                {
                    data: "longitude"
                },
                {
                    data: "created_at", 
                    visible: false,
                    render: function (data, type, row, meta) {
                        return !data ? '-' : moment(data).format('DD MMMM YYYY, HH:mm')
                    }
                },
                {
                    data: "verified",
                    render: function (data, type, row, meta) {
                        let text = ''
                        let textColor = ''
                        let bgColor = ''
                        if (data === 1) {
                            text = 'Valid'
                            textColor = 'green'
                            bgColor = '#D8EED9'
                        }
                        else if (data === 2) {
                            text = 'Tidak Valid'
                            textColor = 'red'
                            bgColor = '#FFEBEB'
                        } else{
                            text = 'Menunggu Verifikasi'
                            textColor = 'primary'
                            bgColor = '#E2F1FD'
                        }
                        return `
                            <div class="text-center pa-2">
                                <div style="width:65%;background-color:${bgColor};" class="text-capitalize v-btn v-btn--elevated v-theme--light text-${textColor} v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated"><i class="mdi-checkbox-blank-circle mdi v-icon notranslate v-theme--light v-icon--size-x-small v-icon--start" aria-hidden="true"></i>${text}
                                </div>
                            </div>`
                    }
                },
                {
                    data: "id",
                    visible: isSuperUser,
                    render: function (data, type, row, meta) {
                        return `
                            <div class="d-flex" style="width: 100%;">
                                <button style="width:100%%;background-color:#E2F1FD;" class="mx-1 text-capitalize v-btn v-btn--elevated v-theme--light text-primary v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated btn-detail-finding" data-id="${data}">
                                    Verifikasi
                                </button>
                            </div>
                        `
                    }
                },
            ],
            rowClick: function(evt)
            {
                // rowId.value = evt.data.id
            }
        })
    })

    /* CRUD Methods */
    const reloadData = () => {
        table.ajax.reload()
    }

    const addData = () => {
        router.push({
            path : "/finding/tambah"
        })
    }

    const editData = () => {
        var rows = table.rows('.selected').data()
        if(!rows[0]){
            snackbarText.value = 'Data belum dipilih.'
            snackbar.value = true
            return
        }
        router.push({
            path : "/finding/"+rows[0].id
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
          title: 'Hapus Data?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Oke',
          cancelButtonText: 'Batal',
        }).then((result) => {
          if (result.isConfirmed) {
            authFetch("/finding/" + rows[0].id, {
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

    const handleClick = async (e:any) => {
        if (e.target.matches(".btn-detail-finding")) {
            Swal.fire({
            title: 'Verfikasi Laporan.',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Setuju',
            denyButtonText: `Tolak`,
        }).then((result) => {
            let data = {
                id: e.target.dataset.id,
                action: ''
            }
            if (result.isConfirmed) {
                data.action = 'approve';
            } else if (result.isDenied) {
                data.action = 'reject';
            }
            else return;
            authFetch('/finding/verification', {
                method: 'POST',
                body: JSON.stringify(data),
            })
            .then((res) => {
                if (res.status === 201) {
                } else if (res.status === 400) {
                }
                return res.json()
                })
            .then((js) => {
                console.log(js)
                if(js.code_status == 1) {
                    Swal.fire({
                        title : 'Laporan Telah di Setujui!',
                        icon : 'success',
                    }).then((ok) => {
                        if (ok.isConfirmed) {
                            router.push({
                                path : "/finding"
                            })    
                        }
                    })
                } else if (js.code_status == 2) {
                    Swal.fire({
                        title : 'Laporan Telah di Tolak!',
                        icon : 'error',
                    }).then((ok) => {
                        if (ok.isConfirmed) {
                            router.push({
                                path : "/finding"
                            })    
                        }
                    })
                } else {
                    Swal.fire({
                        title : js.message,
                        icon : 'error',
                    }).then((ok) => {
                        if (ok.isConfirmed) {

                        }
                    })
                }
            })
        })
        } else {

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
            <v-card-title class="text-h4" style="line-height: 3rem;">Laporan Kerusakan Jalan</v-card-title>
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
                            Judul Laporan
                        </th>
                        <th class="text-left">
                            Note
                        </th>
                        <th class="text-left">
                            Latitude
                        </th>
                        <th class="text-left">
                            Longitude
                        </th>
                        <th class="text-left">
                            Tanggal
                        </th>
                        <th class="text-left">
                            Status
                        </th>
                        <th class="text-left">
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody @click="handleClick">
                </tbody>
            </datatable>
        </v-card-text>
    </v-card>
</template>