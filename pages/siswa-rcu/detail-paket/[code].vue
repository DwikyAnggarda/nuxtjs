<style type="text/css">
    .scroll {
       overflow-y: scroll
    }
</style>
<script setup lang="ts">
    import {
        ref,
        onMounted,
        computed
    } from 'vue'
    import { authFetch } from '../../../composables/useAuth'
    import { useRoute, useRouter } from 'vue-router'
    import moment from 'moment'
    import Swal from 'sweetalert2'

    definePageMeta({
        middleware: ['auth']
    })

    const route = useRoute();
    const router = useRouter();
    const formUser = ref(null)
    const tableRef = ref(null)
    const formTryout = ref(null)
    let snackbar = ref(false)
    let snackbarText = ref('')
    let loading = ref(false)
    let alert = ref(false)
    let alertText:any = ref('')
    let alertType = ref('')
    let table = ref(null)
    let method = ref('')
    let disabled = ref(false)
    let dialog = ref(false)
    let valid = ref(true)
    let isActive = ref(false)
    let formTitle = ref('')
    let searchinG = ref('')
    let formData = ref({})
    let dataPaket = ref({})
    let dataTryout:any[] = ref(null)
    let selected = ref([])
    onMounted(() => {
        sessionStorage.path = '/siswa-rcu/detail-paket/detail'
        table = createTable(tableRef, {
            ajax: '/paket-siswa-rcu/paket_siswa',
            paramData: function (d:any) {
                d.id = route.params.code
            },
            columns: [
                {
                    data: "name"
                },
                {
                    data: "price"
                },
                {
                    data: "registered_at",
                    render: function (data, type, row, meta) {
                        return !data ? '-' : moment(data).format('DD MMMM YYYY, HH:mm')
                    }
                }
            ],
            rowClick: function(evt)
            {
                console.log(evt)
            }
        })

        authFetch('/siswa-rcu/'+route.params.code)
        .then((res) => {
            return res.json()
        })
        .then((js) => {
            dataPaket.value = js.details.data
            console.log(dataPaket.value)
        });
    })

    /* Methods */
    const handleClick = async (e:any) => {
    }

    /* CRUD Methods */
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
        <v-card-item title="Data User">
        </v-card-item>
        </v-col>
        <v-col>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn size="small" @click="reloadData" color="surface-variant" v-if="false" variant="text" icon="mdi-refresh"></v-btn>
                <v-btn size="small" @click="addData" color="surface-variant" v-if="false" variant="text" icon="mdi-plus"></v-btn>
                <v-btn size="small" @click="deleteData" color="surface-variant" v-if="false" variant="text" icon="mdi-delete"></v-btn>
            </v-card-actions>
        </v-col>
        </v-row>
        <v-card-text class="py-0">
            <v-row class="mb-3">
                <v-col cols="auto">
                    <v-card width="200" outlined color="transparent">
                        <v-card-item>
                            <v-card-title>{{ dataPaket.name }}</v-card-title>

                            <v-card-subtitle>{{ dataPaket.phone }}</v-card-subtitle>
                            <v-card-subtitle>{{ dataPaket.email }}</v-card-subtitle>
                            <v-card-subtitle>{{ dataPaket.school }}</v-card-subtitle>
                            <v-card-subtitle>{{ dataPaket.nik }}</v-card-subtitle>
                        </v-card-item>
                    </v-card>
                </v-col>
            </v-row>
            <datatable id="tableRef" density="compact" ref="tableRef" :filter="true">
                <thead>
                    <tr>
                        <th class="text-left">
                            NAMA PAKET
                        </th>
                        <th class="text-left">
                            HARGA
                        </th>
                        <th class="text-left">
                            TANGGAL BELI
                        </th>
                    </tr>
                </thead>
                <tbody @click="handleClick">
                </tbody>
            </datatable>
        </v-card-text>

        <v-row justify="center">
            <v-dialog v-model="dialog" persistent max-width="700" width="100%" scrollable>
                <v-card>
                    <v-form ref="formUser" v-model="valid" lazy-validation>
                            <v-card-title>
                                <v-btn
                                    @click="dialog = false"
                                    icon="mdi-chevron-left"
                                    size="small"
                                    variant="text"
                                ></v-btn>
                                <span class="text-h5">{{ formTitle }}</span>
                            </v-card-title>
                            <v-card-text>
                                <v-container>
                                    <v-card
                                        class="mx-auto"
                                        max-width="800"
                                    >
                                        <v-toolbar>
                                            <v-text-field
                                                v-model="searchinG"
                                                clearable
                                                hide-details
                                                label="Cari User"
                                                prepend-inner-icon="mdi-magnify"
                                                single-line
                                            ></v-text-field>
                                        </v-toolbar>

                                        <v-list height="300px" class="scroll" lines="three">
                                                <v-list-item
                                                    v-for="(item, i) in allDataTryout"
                                                    :key="i"
                                                    :disabled="loading"
                                                    >

                                                    <template v-slot:prepend="">
                                                        <v-list-item-action start>
                                                            <v-checkbox-btn v-model="selected" :value="item.code"></v-checkbox-btn>
                                                        </v-list-item-action>
                                                    </template>

                                                    <v-list-item-title> {{ item.name }} </v-list-item-title>

                                                    <v-list-item-subtitle>
                                                        Asal Sekolah : {{ item.school }}
                                                    </v-list-item-subtitle>

                                                    <v-list-item-subtitle>
                                                        Nomor Telepon : {{ item.phone }}
                                                    </v-list-item-subtitle>

                                                    <v-list-item-subtitle>
                                                        Email : {{ item.email }}
                                                    </v-list-item-subtitle>
                                                    <v-divider></v-divider>

                                                </v-list-item>
                                        </v-list>
                                    </v-card>
                                </v-container>
                            </v-card-text>
                            <div class="px-10 pb-5 text-right">
                                <v-btn
                                    variant="tonal" color="grey"
                                    @click="dialog = false"
                                    class="mr-5"
                                >
                                    Batal
                                </v-btn>
                                <v-btn
                                    class="text-white" color="#5C9527"
                                    @click="submitForm" 
                                    :disabled="disabled"
                                    prepend-icon="mdi-content-save"
                                    :loading="loading"
                                >
                                    Simpan
                                </v-btn>
                            </div>
                    </v-form>
                </v-card>
            </v-dialog>
        </v-row>
    </v-card>
</template>