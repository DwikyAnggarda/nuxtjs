<script setup lang="ts">
    import {
        ref,
        reactive,
        onMounted,
        onUnmounted
    } from 'vue'

    import $ from 'jquery';
    import Swal from 'sweetalert2'
    import { authFetch } from '../../composables/useAuth'
    import { useRouter } from 'vue-router'
    import { useRoute } from 'vue-router'
    import moment from 'moment/min/moment-with-locales'
    import { tsXLXS } from 'ts-xlsx-export';

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
    let searchInput = ref(null)
    let total_pembayaran = ref(0)
    let formTitle = ref('')
    let formData = ref({})
    let filter = reactive({})
    let status = ref({})
    let statusId:any = ref(null)
    let filteredBank = ref([])
    let i_bank = ref(null)
    let bank = ref({})
    let filteredStatus = ref([
        { name: 'Menunggu Pembayaran', id: 0 },
        { name: 'Menunggu Konfirmasi', id: 1 },
        { name: 'Pembayaran Berhasil', id: 2 },
        { name: 'Pembayaran Gagal', id: 3 },
        { name: 'Semua', id: 5 }
    ])
    let paket = ref({})
    let filteredPaket = ref([
        { name: 'SEMUA', id: 'SEMUA' },
        { name: 'RCU', id: 'RCU' },
        { name: 'SSC', id: 'SSC' },
    ])
    let rules = ref({
        usernameRules: [
            (v: any) => !!v || 'Username wajib diisi',
            (v: any) => (v && v.length > 3) || 'Name minimal 3 karakter',
        ],
        passwordRules: [],
        emailRules: [
            (v: any) => !!v || 'E-mail wajib diisi',
            (v: any) => /.+@.+\..+/.test(v) || 'E-mail harus valid',
        ]
    })

     const handleClick = async (e:any) => {
        if (e.target.matches(".detail-pembayaran-btn")) {
            router.push({
                path : "/payment/"+e.target.dataset.code
            })
        }
    }
    const currency = (value) => {
        let val = (value/1).toFixed(2).replace('.', ',')
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    }
    var total_bayar = 0;
    onMounted(() => {     
        if (sessionStorage.length > 0 && sessionStorage.path === '/payment/detail') {
            let paketSession = !sessionStorage.paket ? {id: null, name: 'Paket'} : JSON.parse(sessionStorage.paket)
            let statusSession = !sessionStorage.status ? {id: null, name: 'Status'} : JSON.parse(sessionStorage.status)
            let bankSession = !sessionStorage.bank ? {bank_prefix: null, name: 'Bank'} : JSON.parse(sessionStorage.bank)
            
            filter.status = statusSession.id
            filter.bank = bankSession.bank_prefix
            filter.paket_type = paketSession.id == 'RCU' ? 'Training' : paketSession.id

            paket.value = paketSession
            status.value = statusSession
            bank.value = bankSession
        } else {
            sessionStorage.clear()
            sessionStorage.path = '/payment'
            filter.status = statusId.value
            filter.bank = i_bank.value
            filter.paket_type = paket.value.id == 'RCU' ? 'Training' : paket.value.id

            paket.value = {id: null, name: 'Paket'}
            status.value = {id: null, name: 'Status'}
            bank.value = {bank_prefix: null, name: 'Bank'}
        }

        moment.locale('id')        
        table = createTable(tableRef, {
            ajax: '/payment/all',
            filterBy: [0,2,3],
            stateSave: true,
            paramData: function (d:any) {

                var filtered = JSON.parse(JSON.stringify(filter))
                for (const key in filtered) {
                    d[key] = filtered[key] === false ? 0: filtered[key]
                }

            },
            order : [
                [2, 'desc']
            ],
            columns: [
                { data: "category",
                  render: function(data, type, row, meta) {
                    if (data ==  'ssc') return 'SSC'
                    else return 'RCU'
                  }  
                },
                { data: "code" },
                { data: "updated_at",
                render: function (data, type, row, meta) {
                    return !data ? '-' : moment(data).format('DD MMMM YYYY, HH:mm')
                } },
                { data: "user_name" },
                { data: "paket_name" },
                { data: "bank_name",
                render: function (data, type, row, meta) {
                    return !data ? '-' : `${row.bank_prefix} (${data}) - ${row.rekening}`
                } },
                { data: "amount",
                  render: function (data, type, row, meta) {
                    return `<span>Rp. `+currency(row.amount)+`</span>`
                  } 
                },
                // { data: "payment_status" },
                {
                    data: "payment_status",
                    sortable: false,
                    render: function (data, type, row, meta) {
                        // return !data ? '-' : moment(data).format("DD/MM/YYYY")
                        if (row.payment_status == 1){
                            return `
                            <div class="text-center pa-2">
                                <button type="button" style="width:95%;background-color:#FFE6C7;color:#666666" class="text-capitalize v-btn v-btn--elevated v-theme--light v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated detail-pembayaran-btn" data-code="${row.code}"><i class="mdi-checkbox-blank-circle mdi v-icon notranslate v-theme--light v-icon--size-x-small v-icon--start" aria-hidden="true" style="color: #FB8C00"></i>Menunggu Konfirmasi
                                </button>
                            </div>`
                        } else if (row.payment_status == 2) {
                            return `
                            <div class="text-center pa-2">
                                <button type="button" style="width:95%;background-color: #D8EED9;color:#666666" class="text-capitalize v-btn v-btn--elevated v-theme--light v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated detail-pembayaran-btn" data-code="${row.code}"><i class="mdi-checkbox-blank-circle mdi v-icon notranslate v-theme--light v-icon--size-x-small v-icon--start" aria-hidden="true" style="color: #4CAF50"></i>Pembayaran Berhasil
                                </button>
                            </div>`
                        } else if (row.payment_status == 3) {
                            return `
                            <div class="text-center pa-2">
                                <button type="button" style="width:95%;background-color: #FFEBEB;color:#666666" class="text-capitalize v-btn v-btn--elevated v-theme--light v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated detail-pembayaran-btn" data-code="${row.code}"><i class="mdi-checkbox-blank-circle mdi v-icon notranslate v-theme--light v-icon--size-x-small v-icon--start" aria-hidden="true" style="color: #FF5252"></i>Pembayaran Gagal
                                </button>
                            </div>`
                        } else {
                            return `
                            <div class="text-center pa-2">
                                <button type="button" style="width:95%;background-color:#E2F1FD;color:#666666" class="text-capitalize v-btn v-btn--elevated v-theme--light v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated detail-pembayaran-btn" data-code="${row.code}"><i class="mdi-checkbox-blank-circle mdi v-icon notranslate v-theme--light v-icon--size-x-small v-icon--start" aria-hidden="true" style="color: #2196F3"></i>Menunggu Pembayaran
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
            }
        })

        authFetch('/bank')
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                js.data.map((item:any) => {
                    let obj = {}
                    obj = {
                        name: `${item.bank_prefix} (${item.bank_fullname})`,
                        bank_prefix: item.bank_prefix
                    }

                    filteredBank.value.push(obj)
                })

                var obj2 = {
                    name: 'Semua',
                    bank_prefix: 'all'
                }

                filteredBank.value.push(obj2);
            });

        count_total_pembayaran()
    })

    onUnmounted(() => {
        if (sessionStorage.path === '/payment/detail') {
            reloadDataWithoutPage()
        }
    })

    const count_total_pembayaran = () => {
        let tipe_paket = paket.value.id == "RCU" ? "Training" : paket.value.id
        let search = !searchInput.value ? null : searchInput.value
        authFetch(`/payment/count_total_pembayaran/`+tipe_paket+`/`+statusId.value+`/`+search+`/`+i_bank.value).then((res) => {
          return res.json()
        }).then((js) => {
            total_pembayaran.value = currency(js.total_payment)
        })
    }

    const onChangedStatus = (val:any) => {
        statusId.value = status.value.id
        filter.status = statusId.value
        // sessionStorage.statusId = statusId.value
        sessionStorage.status = JSON.stringify(status.value)

        count_total_pembayaran()
        reloadData()
    }

    const onChangedPaketVal = (val:any) => {
        filter.paket_type = paket.value.id == 'RCU' ? 'Training' : paket.value.id
        // sessionStorage.paketId = paket.value.id
        sessionStorage.paket = JSON.stringify(paket.value)

        count_total_pembayaran()
        reloadData()
    }

    const onChangedFilterBank = (val:any) => {
        i_bank.value = bank.value.bank_prefix
        filter.bank = i_bank.value
        // sessionStorage.bankId = i_bank.value
        sessionStorage.bank = JSON.stringify(bank.value)

        count_total_pembayaran()
        reloadData()
    }

    const exportToXlsx = () => {
        var tipe_paket = paket.value.id == "RCU" ? "Training" : paket.value.id
        authFetch(`/payment/download_pembayaran/`+tipe_paket+`/`+statusId.value+`/`+searchInput.value+`/`+i_bank.value).then((res) => {
          return res.json()
        }).then((js) => {
            if ( js.length > 0)
            {
                var a = [];
                function renameKeys(obj, newKeys) {
                  const keyValues = Object.keys(obj).map(key => {
                    const newKey = newKeys[key] || key;
                    return { [newKey]: obj[key] };
                  });
                  return Object.assign({}, ...keyValues);
                }
                js.map(function(item){
                    const obj = item;
                    const newKeys = { category: "Tipe", code: "No Pesanan", created_at:"Tanggal", user_name: "User", amount: "Harga", bank_fullname: "Bank", rekening: "Rekening", payment_status: "Status Pembayaran" };
                    const renamedObj = renameKeys(obj, newKeys);
                    a.push(renamedObj)
                })
                var title = 'Rekap Pembayaran'
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

    const reloadData = () => {
        table.ajax.reload()
    }

    const reloadDataWithoutPage = () => {
        table.ajax.reload(null,false)
    }

    const submitForm = async () => {
        const formUserRef = formUser.value
        let status = await formUserRef.validate()
        let data = Object.keys(formData.value).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(formData.value[key])).join("&")

        if (status.valid) {
            disabled.value = true
            let urlSubmit = "/users"
            if (method.value == "PUT") urlSubmit = "/users/" + formData.value.id

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
                    // console.log(js.details)
                    for (var key in js.details) {
                        if (js.details.hasOwnProperty(key)) {
                            console.log(errors.push(js.details[key]))
                        }
                    }

                    return;
                }

                table.ajax.reload()
                dialog.value = false
                snackbarText.value = js.message
                snackbar.value = true
            })
        }
    }

    $(document).on('click', '.search-datatable', function() {
        var myEl = $('.input-search-datatable');
        var input = myEl.find('input')[0].value
        searchInput.value = input
        count_total_pembayaran()
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
                <v-card-item>
                    <v-card-title class="text-h4" style="line-height: 3rem;">Data Pembayaran Paket</v-card-title>
                </v-card-item>
            </v-col>
            <v-col>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn size="small" @click="reloadData" color="surface-variant" variant="text" icon="mdi-refresh"></v-btn>
        </v-card-actions>
            </v-col>
        </v-row>
        <v-card-text class="py-0">
            <v-row justify="end">
                <v-col md="4" sm="4">
                    <v-select
                        v-model="paket"
                        :items="filteredPaket"
                        @update:modelValue="onChangedPaketVal"
                        item-title="name"
                        item-value="id"
                        label="Tipe Paket"
                        variant="solo"
                        return-object
                        single-line
                    ></v-select>
                </v-col>
                <v-col md="4" sm="4">
                    <v-select
                        v-model="status"
                        :items="filteredStatus"
                        @update:modelValue="onChangedStatus"
                        item-title="name"
                        item-value="id"
                        label="Status"
                        variant="solo"
                        return-object
                        single-line
                    ></v-select>
                </v-col>
                <v-col md="4" sm="4">
                    <v-select
                        v-model="bank"
                        :items="filteredBank"
                        @update:modelValue="onChangedFilterBank"
                        item-title="name"
                        item-value="bank_prefix"
                        label="Bank"
                        variant="solo"
                        return-object
                        single-line
                    ></v-select>
                </v-col>
            </v-row>
            <v-row justify="end" style="margin-top: 0px !important;">
                <v-col cols="6">
                    <v-btn @click="exportToXlsx" block color="#6E8A3D" class="text-white" style="height: 56px;">
                        Download Laporan
                    </v-btn>
                </v-col>
            </v-row>
            <datatable density="compact" ref="tableRef" id="payment" :filter="true">
                <thead>
                    <tr>
                        <th class="text-left">
                            Tipe
                        </th>
                        <th class="text-left">
                            No Pesanan
                        </th>
                        <th class="text-left">
                            Tanggal
                        </th>
                        <th class="text-left">
                            User
                        </th>
                        <th class="text-left">
                            Paket
                        </th>
                        <th class="text-left">
                            Bank
                        </th>
                        <th class="text-left">
                            Harga
                        </th>
                        <th class="text-left">
                            Status Pembayaran
                        </th>
                    </tr>
                </thead>
                <tbody @click="handleClick">
                </tbody>
                <tfoot>
                    <tr>
                        <th colspan="5" class="font-weight-black text-right">Total</th>
                        <th colspan="2" class="font-weight-black">Rp. {{ total_pembayaran }}</th>
                    </tr>
                </tfoot>
            </datatable>
        </v-card-text>
        <v-row justify="center">
        <v-dialog v-model="dialog" persistent max-width="450px">
            <v-card>
                <v-form ref="formUser" v-model="valid" lazy-validation>
                    <v-card-title>
                    <span class="text-h5"> {{ formTitle }} </span>
                    </v-card-title>
                    <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field label="Username" v-model="formData.name" :rules="rules.usernameRules" clearable required></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="4" v-if="false">
                                <v-text-field label="Legal middle name" hint="example of helper text only on focus" clearable></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="4" v-if="false">
                                <v-text-field label="Legal last name*" hint="example of persistent helper text" clearable persistent-hint required ></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model="formData.email" :rules="rules.emailRules" label="E-mail" required clearable></v-text-field>
                                <!-- <v-text-field label="Email" v-model="formData.email" :rules="rules.emailRules" clearable required ></v-text-field> -->
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model="formData.password" :rules="rules.passwordRules" label="Password" type="password" clearable required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field label="Phone" v-model="formData.phone" clearable></v-text-field>
                            </v-col>
                            <v-col
                                cols="12"
                                sm="6"
                            v-if="false">
                                <v-select
                                :items="['0-17', '18-29', '30-54', '54+']"
                                label="Age*"
                                required
                                ></v-select>
                            </v-col>
                            <v-col
                                cols="12"
                                sm="6"
                            v-if="false">
                                <v-autocomplete
                                :items="['Skiing', 'Ice hockey', 'Soccer', 'Basketball', 'Hockey', 'Reading', 'Writing', 'Coding', 'Basejump']"
                                label="Interests"
                                multiple
                                ></v-autocomplete>
                            </v-col>
                        </v-row>
                    </v-container>
                    <small v-if="false">*indicates required field</small>
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