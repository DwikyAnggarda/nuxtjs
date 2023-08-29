<script setup lang="ts">
    import {
        ref,
        onMounted
    } from 'vue'

    import $ from 'jquery';
    import Swal from 'sweetalert2'
    import { authFetch } from '../../composables/useAuth'
    import { useRouter } from 'vue-router'
    import { vueRoute } from 'vue-route'

    definePageMeta({
        middleware: ['auth']
    })
    const route = useRoute()
    const router = useRouter()
    let table = ref(null)
    const tableRef = ref(null)
    const formUser = ref(null)
    let method = ref('')
    let disabled = ref(false)
    let dialog = ref(false)
    let valid = ref(true)
    let snackbar = ref(false)
    let snackbarText = ref('')
    let formTitle = ref('')
    let formData = ref({})
    let src = ref('/images/background/no-image.png')
    let no_pesanan = ref('')
    let tanggal = ref('')
    let user = ref('')
    let status = ref('')
    let color = ref('')
    let nama_paket = ref('')
    let harga_paket = ref('')
    let isConfirm = ref('d-none')

    onMounted(() => {
        sessionStorage.path = '/payment/detail'
        authFetch(`/payment/get_detail_payment/`+route.params.code).then((res) => {
            return res.json()
        }).then((js) => {
            console.log(js.data[0])
            no_pesanan.value = js.data[0].code
            tanggal.value = js.data[0].created_at
            user.value = js.data[0].user_name
            nama_paket.value = js.data[0].paket_name
            harga_paket.value = 'Rp. '+currency(js.data[0].amount)
            if (js.data[0].url) {
                src.value = js.data[0].url
            }

            if (js.data[0].payment_status == 1) {
                color.value = 'orange'
                status.value = 'Menunggu Konfirmasi'
                isConfirm.value = ''
            } else if (js.data[0].payment_status == 2) {
                color.value = 'green'
                status.value = 'Pembayaran Berhasil'
                isConfirm.value = 'd-none'
            } else if (js.data[0].payment_status == 3) {
                color.value = 'red'
                status.value = 'Pembayaran Gagal'
                isConfirm.value = 'd-none'
            } else {
                color.value = 'primary'
                status.value = 'Menunggu Pembayaran'
                isConfirm.value = 'd-none'
            }
        })

        const currency = (value) => {
            let val = (value/1).toFixed(2).replace('.', ',')
            return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
        }
    })

    const handleClick = (e) => {
        Swal.fire({
            title: 'Konfirmasi pembayaran paket.',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Setuju',
            denyButtonText: `Tolak`,
        }).then((result) => {
            let data = {
                id: route.params.code,
                action: ''
            }
            if (result.isConfirmed) {
                data.action = 'approve';
            } else if (result.isDenied) {
                data.action = 'reject';
            }
            else return;
            authFetch('/payment/process', {
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
                if(js.code_status == 2) {
                    Swal.fire({
                        title : 'Pembayaran Telah di Setujui!',
                        icon : 'success',
                    }).then((ok) => {
                        if (ok.isConfirmed) {
                            router.push({
                                path : "/payment"
                            })    
                        }
                    })
                } else if (js.code_status == 3) {
                    Swal.fire({
                        title : 'Pembayaran Telah di Tolak!',
                        icon : 'error',
                    }).then((ok) => {
                        if (ok.isConfirmed) {
                            router.push({
                                path : "/payment"
                            })    
                        }
                    })
                } else {
                    Swal.fire({
                        title : js.message,
                        icon : 'error',
                    }).then((ok) => {
                        if (ok.isConfirmed) {
                            router.push({
                                path : "/payment"
                            })    
                        }
                    })
                }
            })
        })                
    }

    const openDialog = () => {
        dialog.value = true
    }

    const back = () => {
        sessionStorage.path = '/payment/detail'
        router.push({
            path : "/payment"
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
                <v-card-item title="Detail Pembayaran RCU Education">
                </v-card-item>
            </v-col>
        </v-row>
        <v-card-text class="py-0">
            <v-row>
                <v-col cols="6">
                    <v-text-field v-model="no_pesanan" label="No Pesanan" readonly></v-text-field>
                    <v-text-field v-model="tanggal"  label="Tanggal" readonly></v-text-field>
                    <v-text-field v-model="user" label="User" readonly></v-text-field>
                    <v-text-field v-model="nama_paket" label="Nama Paket" readonly></v-text-field>
                    <v-text-field v-model="harga_paket" label="Harga Paket" readonly></v-text-field>
                </v-col>
                <v-col cols="6">
                    <v-col class="d-flex flex-column">
                        <span>Status Pembayaran</span>
                        <span>
                            <v-chip class="ma-2" size="large" :color="color">
                              {{ status }}
                            </v-chip>
                        </span>
                    </v-col>
                    <v-col style="width: 100%;padding: 0px 50px 0px 50px;" class="d-flex justify-center">
                        <v-img @click="openDialog" class="bg-white" style="cursor: pointer;width: 70%;" :aspect-ratio="4 / 3" :src="src"></v-img>
                    </v-col>
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-action>
            <v-col class="px-10 pb-5 text-right">
                <v-btn class="mx-2" @click="back" depressed variant="tonal" color="grey">Kembali</v-btn>
                <v-btn @click="handleClick" :class="isConfirm" depressed style="color: white; background-color: #5C9527">Konfirmasi Pembayaran</v-btn>
            </v-col>
        </v-card-action>
    </v-card>
        <v-row justify="center">
            <v-dialog
              v-model="dialog"
              width="auto"
            >
              <v-card>
                <v-card-text>
                  <v-img class="bg-white" width="700" :aspect-ratio="4 / 3" :src="src"></v-img>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" block @click="dialog = false">Tutup</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
        </v-row>
</template>