<script setup lang="ts">
    import {
        ref,
        reactive,
        onMounted
    } from 'vue'
    import { vueRoute } from 'vue-route'
    import { useRouter } from 'vue-router'
    import { authFetch } from '../../../composables/useAuth'
    import moment from 'moment'
    import Swal from 'sweetalert2'
    import $ from 'jquery'
    import Datepicker from '@vuepic/vue-datepicker'
    import '@vuepic/vue-datepicker/dist/main.css'

    definePageMeta({
        middleware: ['auth']
    })
    const router = useRouter()
    const route = useRoute()
    let table = ref(null)
    const tableRef = ref(null)
    const formKelas = ref(null)
    let method = ref('')
    let disabled = ref(false)
    let dialog = ref(false)
    let valid = ref(true)
    let snackbar = ref(false)
    let isActive = ref(false)
    let snackbarText = ref('')
    let formTitle = ref('')
    let formData = ref({})
    let status = ref(null)
    let statusId:any = ref(null)
    let filteredStatus = ref([
        { name: 'Aktif', id: 1 },
        { name: 'Tidak Aktif', id: 0 },
        { name: 'Semua', id: 2 }
    ])
    onMounted(() => {
        sessionStorage.path = '/nilai/user_tryout/detail'
        table = createTable(tableRef, {
            ajax: '/nilai/get_user_tryout/'+route.params.code,
            filterBy: [0,4],
            paramData: function (d:any) {
                d.status = statusId.value
            },
            columns: [
                {
                    data: "peringkat"
                },
                {
                    data: "name"
                },
                {
                    data: "email"
                },
                {
                    data: "phone"
                },
                {
                    data: "school"
                },
                {
                    data: "code",
                    sortable: false,
                    render: function (data, type, row, meta) {
                        // return !data ? '-' : moment(data).format("DD/MM/YYYY")
                        return `<div class="pa-2">
                            <button type="button" style="background-color:#E2F1FD;color:#2196F3" class="v-btn v-btn--elevated v-theme--light v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated detail-tryout-btn" data-code="${data}">
                                Lihat Nilai
                            </button>
                        </div>`
                    }
                },
            ],
            rowClick: function(evt)
            {
                console.log(evt)
            }
        })
        // this.$emit('ready')
    })

    /* Methods */
    const onChangedStatus = (val:any) => {
        statusId.value = status.value.id
        reloadData()
    }

    const handleClick = async (e:any) => {
        if (e.target.matches(".detail-tryout-btn")) {
            router.push({
                path : "/nilai/user_tryout/detail_siswa",
                query: {
                	user_code : e.target.dataset.code,
                	tryout_code : route.params.code
                }
            })
            console.log(e.target.dataset.tipe)
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
        <v-card-item title="Data Siswa">
            <template v-slot:subtitle>
                List Siswa
            </template>
        </v-card-item>
        </v-col>
        </v-row>
        <v-card-text class="py-0">
            <v-row>
            <v-col md="10" sm="6">
            </v-col>
            <v-col md="2" sm="6">
                <v-select
                    v-model="status"
                    :items="filteredStatus"
                    @update:modelValue="onChangedStatus"
                    item-title="name"
                    item-value="id"
                    label="Status"
                    return-object
                    single-line
                    variant="solo"
                ></v-select>
            </v-col>
        </v-row>
            <datatable density="compact" ref="tableRef" :filter="true">
                <thead>
                    <tr>
                        <th class="text-left">
                            Peringkat
                        </th>
                        <th class="text-left">
                            Nama
                        </th>
                        <th class="text-left">
                            Email
                        </th>
                        <th class="text-left">
                            No Handphone
                        </th>
                        <th class="text-left">
                            Asal Sekolah
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