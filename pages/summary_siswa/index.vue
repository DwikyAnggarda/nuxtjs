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
        sessionStorage.path = '/summary_siswa'
        table = createTable(tableRef, {
            ajax: '/summary_siswa',
            // order : [
            //     [4, 'desc'],
            // ],
            columns: [
                {
                    data: "name"
                },
                {
                    data: "pakets",
                    // sortable: false,
                    render: function (data, type, row, meta) {
                        var template = ``
                        var sisa = ``
                        var jumlah = 0
                        if(data){
                            template = ``
                            var a = data.split(',');
                            const uniqueArray = [...new Set(a)];
                            uniqueArray.map(function(item,index){
                                if(index <= 2){
                                    template +=`<div class="text-capitalize ma-1 v-btn v-btn--elevated v-theme--light v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated detail-tryout-btn" style="background-color:#E2F1FD;color:#2196F3">`+item+`</div>`  
                                }else {
                                    jumlah = jumlah + 1    
                                }
                            })
                            if(jumlah > 0){
                                template +=`<div class="ma-1 v-btn v-btn--elevated v-theme--light v-btn--density-default elevation-0 rounded-pill v-btn--size-small v-btn--variant-elevated detail-tryout-btn" style="background-color:#F2F4F7;">+`+jumlah+`</div>`
                            }
                        } else {
                            template =``
                            sisa =``
                        }
                        return `<span>`+template+sisa+`</span>`;
                    }
                },
                {
                    data: "jumlah_to"
                },
                {
                    data: "phone"
                },
                {
                    data: "email"
                },
                {
                    data: "user_code",
                    visible:false
                }
            ],
            rowClick: function(evt)
            {
                console.log(evt)
                router.push({
                    path : "/summary_siswa/"+evt.data.user_code
                })
            }
        })
    })

    // const handleClick = async (e:any) => {    
    //     console.log(e)
        
    // }

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
                <v-card-title class="text-h4" style="line-height: 3rem;">Summary Siswa</v-card-title>
            </v-card-item>
        </v-col>
        </v-row>
        <v-card-text class="py-0">
            <datatable density="compact" ref="tableRef" :filter="true">
                <thead>
                    <tr>
                        <th class="text-left">NAMA SISWA</th>
                        <th class="text-left">PAKET YANG DIIKUTI</th>
                        <th class="text-left">JUMLAH TRYOUT</th>
                        <th class="text-left">NO TELEPON</th>
                        <th class="text-left">EMAIL</th>
                        <th class="text-left">user code</th>
                    </tr>
                </thead>
                <tbody @click="handleClick">
                </tbody>
            </datatable>
        </v-card-text>
    </v-card>
</template>