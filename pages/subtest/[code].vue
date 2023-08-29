<style type="text/css">
    .scroll {
       overflow-y: scroll
    }
    .dp__pointer{
        height: 57px !important;
    }
</style>
<script setup lang="ts">
    import {
        ref,
        reactive,
        onMounted
    } from 'vue'
    import { authFetch } from '../../composables/useAuth'
    import moment from 'moment'
    import Swal from 'sweetalert2'
    import Datepicker from '@vuepic/vue-datepicker'
    import '@vuepic/vue-datepicker/dist/main.css'
    import CKEditor from '@ckeditor/ckeditor5-vue'
    import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

    definePageMeta({
        middleware: ['auth']
    })
    const route = useRoute()
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
    let title_subtest = ref('')
    let formTitle = ref('')
    let searchinG = ref('')
    let formData = ref({})
    let dataTryout:any[] = ref(null)
    let selected = ref([])
    // const kelas = []
    // const mapel = []
    let filteredKelas = ref([])
    let filteredMapel = ref([])
    let i_kelas = ref(0)
    let i_mapel = ref(0)
    let kelas = ref(null)
    let mapel = ref(null)
    let checkbox1 = ref(false)
    let dates = ref([])
    onMounted(() => {
        // const startDate = new Date()
        // const endDate = new Date(new Date().setDate(startDate.getDate() + 7))
        // dates.value = [startDate, endDate]
        sessionStorage.path = '/subtest/detail'

        table = createTable(tableRef, {
            ajax: '/subtest/detail_subtest/'+route.params.code,
            order: [
				[4, 'desc']
			],
            columns: [
                {
                    data: "code"
                },
                {
                    data: "question"
                },
                {
                    data: "kelas"
                },
                {
                    data : "mapel"
                },
                {
                    data : "created_at", visible: false
                },
            ],
            rowClick: function(evt)
            {
                console.log(evt)
            }
        })
        // this.$emit('ready')

        authFetch('/subtest/curr_subtest/'+route.params.code)
        .then((res) => {
            return res.json()
        }).then((js) => {
            title_subtest.value = js.title
        })

        authFetch('/kelas')
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                js.data.map((item:any) => {
                    let obj = {}
                    obj = {
                        name: item.name,
                        id: item.id
                    }

                    filteredKelas.value.push(obj)
                })

                var obj2 = {
                    name: 'Semua',
                    id: 0
                }

                filteredKelas.value.push(obj2);
            });

        authFetch('/mapel')
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                js.data.map((item:any) => {
                    let obj = {}
                    obj = {
                        name: item.name,
                        id: item.id
                    }

                    filteredMapel.value.push(obj)
                })

                var obj2 = {
                    name: 'Semua',
                    id: 0
                }

                filteredMapel.value.push(obj2);
            });
    })

    const getPaketTryout = async () => {
        // authFetch('/subtest/list_question/'+route.params.code)
        // .then((res) => {
        //     return res.json()
        // })
        // .then((js) => {
        //     dataTryout.value = js.data

        //     dataTryout.value.map(function (val:any) {
        //         if (val.active === 1) {
        //             selected.value = [...selected.value, val.syscode]
        //         }
        //     })
        // });
        searchData()
    }

    const searchData = async () => {
        // console.log('search', searchinG.value)

        authFetch('/subtest/list_question/'+ route.params.code + `?q=${searchinG.value}&mapel=${i_mapel.value}&kelas=${i_kelas.value}&dates=${dates.value}`)
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                dataTryout.value = js.data

                dataTryout.value.map(function (val:any) {
                    if (val.active === 1) {
                        if (!selected.value.includes(val.syscode)) {
                            selected.value = [...selected.value, val.syscode]
                        }
                    }
                })
            });
    }

    const allDataTryout = computed(() => {
        let tryouts = dataTryout.value
        return tryouts
        // console.log(tryouts)
        // if (!searchinG.value) {
        //     return tryouts
        // }
        // let _search = searchinG.value.toString().toLowerCase()

        // return tryouts.filter( item => {
        //     let text = !item.question ? '-' : item.question.toString().toLowerCase()
        //     let text2 = !item.mapel ? '-' : item.mapel.toString().toLowerCase()
        //     let text3 = !item.kelas ? '-' : item.kelas.toString().toLowerCase()
        //     let text4 = !item.code ? '-' : item.code.toString().toLowerCase()
        //     let text5 = !item.created_at ? '-' : item.created_at.toString().toLowerCase()

        //     return text.indexOf(_search) > -1 || text2.indexOf(_search) > -1 || text3.indexOf(_search) > -1 || text4.indexOf(_search) > -1 || text5.indexOf(_search) > -1
        // })
    })

    /* CRUD Methods */
    const reloadData = () => {
        table.ajax.reload()
        // getPaketTryout()
    }

    const addData = () => {
        formTitle.value = 'Tambah Soal'
        method.value = 'POST'
        dialog.value = true
        disabled.value = false
        getPaketTryout()

        selected.value = []
    }
    
    const deleteData = () => {
        var rows = table.rows('.selected').data()
        if(!rows[0]){
            snackbarText.value = 'Data belum dipilih.'
            snackbar.value = true
            return
        }

        Swal.fire({
          text: 'Hapus Data?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Hapus',
        }).then((result) => {
          if (result.isConfirmed) {
            let paketTryout = rows[0]
            let aa = {
                'question_id' : paketTryout.uuid,
                'subtest_id' : route.params.code
            }
            let urlSubmit = "/subtest/delete_detail_subtest/" + route.params.code
            let data = Object.keys(aa).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(aa[key])).join("&")
            authFetch(urlSubmit, {
                method: "DELETE",
                body : data,
            })
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                table.ajax.reload()
                getPaketTryout()
                snackbarText.value = js.message
                snackbar.value = true
            });
          }
        })

    }

    const submitForm = async () => {
        console.log('result', selected.value)
        // return

        if (selected.value.length < 1) {
            snackbarText.value = 'Data tryout belum dipilih.'
            snackbar.value = true
            return
        } else {
            formData.value.items = JSON.stringify(selected.value)
            let data = Object.keys(formData.value).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(formData.value[key])).join("&")
            loading.value = true
            disabled.value = true
            let urlSubmit = "/subtest/detail_subtest/" + route.params.code

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
                loading.value = false
                disabled.value = false
                let errors = []
                if (!js.success) {
                    for (var key in js.details) {
                        if (js.details.hasOwnProperty(key)) {
                            console.log(errors.push(js.details[key]))
                        }
                    }

                    return;
                }

                table.ajax.reload()
                getPaketTryout()
                dialog.value = false
                snackbarText.value = js.message
                snackbar.value = true
            })
        }
    }

    // other
    const checkAll = () => {
        if (checkbox1.value) {
            allDataTryout.value.map(function (val:any) {
                selected.value = [...selected.value, val.syscode]
            })
        } else {
            selected.value = [];
        }
    }

    const onChangedFilterKelas = (val:any) => {
        i_kelas.value = kelas.value.id
        searchData()
        // console.log('kelas', i_kelas.value)
    }

    const onChangedFilterMapel = (val:any) => {
        i_mapel.value = mapel.value.id
        searchData()
        // console.log('mapel', i_mapel.value)
    }

    const filter_date = (val:any) => {
        let dt = []
        dt[0] = moment(val[0]).format('YYYY-MM-DD')
        dt[1] = moment(val[1]).format('YYYY-MM-DD')
        dates.value = dt
        console.log('date', dates.value)
        searchData()
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
        <v-card-item :title="title_subtest">
            
        </v-card-item>
        </v-col>
        <v-col>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn size="small" @click="reloadData" color="surface-variant" variant="text" icon="mdi-refresh"></v-btn>
                <v-btn size="small" @click="addData" color="surface-variant" variant="text" icon="mdi-plus"></v-btn>
                <v-btn size="small" @click="deleteData" color="surface-variant" variant="text" icon="mdi-delete"></v-btn>
            </v-card-actions>
        </v-col>
        </v-row>
        <v-card-text class="py-0">
            <datatable density="compact" ref="tableRef" :filter="true">
                <thead>
                    <tr>
                        <th class="text-left">KODE SOAL</th>
                        <th class="text-left">SOAL</th>
                        <th class="text-left">KELAS</th>
                        <th class="text-left">MATA PELAJARAN</th>
                        <th class="text-left">CREATED AT</th>
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
                                    <v-row class="mb-5 ml-1">
                                        <v-col cols="12" sm="3" md="3" lg="3">
                                            <v-select
                                                v-model="kelas"
                                                :items="filteredKelas"
                                                @update:modelValue="onChangedFilterKelas"
                                                item-title="name"
                                                item-value="id"
                                                label="Kelas"
                                                variant="solo"
                                                return-object
                                                single-line
                                            ></v-select>
                                        </v-col>
                                        <v-col cols="12" sm="4" md="4" lg="4">
                                            <v-select
                                                v-model="mapel"
                                                :items="filteredMapel"
                                                @update:modelValue="onChangedFilterMapel"
                                                item-title="name"
                                                item-value="id"
                                                label="Mapel"
                                                variant="solo"
                                                return-object
                                                single-line
                                            ></v-select>
                                        </v-col>
                                        <v-col cols="12" sm="5" md="5" lg="5">
                                            <Datepicker v-model="dates" placeholder="Periode" format="dd-MM-yyyy" @update:modelValue="filter_date" month-name-format="long" locale="id" :enable-time-picker="false" range></Datepicker>
                                        </v-col>
                                    </v-row>
                                    <v-card
                                        class="mx-auto"
                                        max-width="800"
                                    >
                                    <span class="float-right">
                                        <!-- <v-btn
                                            variant="tonal"
                                            @click="checkAll"
                                            class="mb-3 mr-3"
                                        >
                                            Pilih semua
                                        </v-btn> -->
                                        <v-checkbox
                                            label="Pilih semua"
                                            v-model="checkbox1"
                                            @change="checkAll"
                                        ></v-checkbox>
                                    </span>
                                    <v-form v-model="valid" @submit.prevent="searchData">
                                        <v-toolbar>
                                            <v-text-field
                                                v-model="searchinG"
                                                clearable
                                                hide-details
                                                label="Cari Soal, Kode Soal | Tekan Enter Untuk Pencarian"
                                                prepend-inner-icon="mdi-magnify"
                                                single-line
                                            ></v-text-field>
                                        </v-toolbar>
                                    </v-form>

                                        <v-list height="300px" class="scroll" lines="three">
                                                <v-list-item
                                                    v-for="(item, i) in allDataTryout"
                                                    :key="i"
                                                    :disabled="loading"
                                                    >

                                                    <template v-slot:prepend="">
                                                        <v-list-item-action start>
                                                            <v-checkbox-btn class="cb" v-model="selected" :value="item.syscode"></v-checkbox-btn>
                                                        </v-list-item-action>
                                                    </template>

                                                    <v-list-item-title v-html="item.question"></v-list-item-title>

                                                    <v-list-item-subtitle>
                                                        Mata Pelajaran : {{item.mapel }}
                                                    </v-list-item-subtitle>
                                                    <v-list-item-subtitle>
                                                        Tanggal : {{ item.created_at }}
                                                    </v-list-item-subtitle>
                                                    <v-list-item-subtitle>
                                                        Kelas : {{ item.kelas }}
                                                    </v-list-item-subtitle>
                                                    <v-list-item-subtitle>
                                                        Kode Soal : {{ item.code }}
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