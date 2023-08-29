<style type="text/css">
    .scroll {
       overflow-y: scroll
    }
    .detail-nilai {
        cursor: pointer;
    }
</style>
<script setup lang="ts">
    import {
        ref,
        reactive,
        onMounted
    } from 'vue'
    import { authFetch } from '../../../composables/useAuth'
    import { vueRoute } from 'vue-route'
    import { useRouter } from 'vue-router'
    import moment from 'moment'
    import Datepicker from '@vuepic/vue-datepicker'
    import '@vuepic/vue-datepicker/dist/main.css'
    import $ from 'jquery';
    import Swal from 'sweetalert2'
    import { tsXLXS } from 'ts-xlsx-export';
    import CKEditor from '@ckeditor/ckeditor5-vue'
    import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

    definePageMeta({
        middleware: ['auth']
    })
    const router = useRouter()
    const route = useRoute()
    const formUser = ref(null)
    const tableRef = ref(null)
    const formTryout = ref(null)
    let snackbar = ref(false)
    let snackbarText = ref('')
    let alert = ref(false)
    let alertText:any = ref('')
    let alertType = ref('')
    let table = ref(null)
    let method = ref('')
    let disabled = ref(false)
    let dialog = ref(false)
    let valid = ref(true)
    let isActive = ref(false)
    let title_tryout = ref('')
    let formTitle = ref('')
    let searchinG = ref('')
    let formData = ref({})
    let dataTryout:any[] = ref(null)
    let selected = ref([])
    onMounted(() => {
        sessionStorage.path = '/nilai/peringkat'
        authFetch(`/nilai/get-seluruh-peringkat/`+route.params.code).then((res) => {
            return res.json()
        }).then((js) => { 
            $('#thead-peringkat').html('')
            $('#tbody-peringkat').html('')
            $('#thead-peringkat').append(`<th class="text-left">PERINGKAT</th>`)
            $('#thead-peringkat').append(`<th class="text-left">NAMA SISWA</th>`)
            $('#thead-peringkat').append(`<th class="text-left">ASAL SEKOLAH</th>`)
            $('#thead-peringkat').append(`<th class="text-left">LAMA MENGERJAKAN</th>`)
            $('#thead-peringkat').append(`<th class="text-left">TOTAL NILAI</th>`)
            js.subtest.map(function(item){
                var template_head = `<th class="text-left">`+item.title+`</th>`
                $('#thead-peringkat').append(template_head)
            })
            const sports_obj = js.data
            var result = Object.keys(sports_obj).map((key) => [Number(key), sports_obj[key]]);
            if(result.length > 0) {
                result.map(function(item,index) {
                    var ranking = index+1
                    var a = item[1]
                    var float_nilai = parseFloat(a.total ? a.total : 0)
                    var total_nilai = float_nilai.toFixed()
                    var nilai = ``
                    var durasi = a.durasi ? a.durasi : '0'
                    var sekolah = a.sekolah ? a.sekolah : '-'
                    js.subtest.map(function(i){
                        var b = i.code
                        nilai += `<td class="text-left">`+parseFloat(a[b]).toFixed()+`</td>`
                    })
                    var template_data = `
                    <tr @click="handleClick" class="detail-nilai" data-uid="`+a.user_code+`" id="`+a.user_code+`">
                        <td class="text-left">`+ranking+`</td>
                        <td class="text-left">`+a.name+`</td>
                        <td class="text-left">`+sekolah+`</td>
                        <td class="text-left">`+durasi+` Menit</td>
                        <td class="text-left">`+total_nilai+`</td>
                        `+nilai+`
                    </tr>`
                    $('#tbody-peringkat').append(template_data)
                })
            } else {
                var template_data = `
                    <tr>
                        <td class="text-center" colspan="3">Tidak ada data</td>
                    </tr>`
                    $('#tbody-peringkat').append(template_data)
            }

            $('.detail-nilai').click(function(){
                var user_id = $(this).attr("data-uid")
                router.push({
                    path : "/nilai/detail_nilai/"+route.params.code,
                    query : {
                        ['user_id'] : user_id
                    }
                })
            })
        })


        authFetch('/nilai/curr_tryout/'+route.params.code)
        .then((res) => {
            return res.json()
        }).then((js) => {
            console.log(js)
            if(js.length > 0){
                title_tryout.value = js[0].name
            }
        })
    })

    /* CRUD Methods */
    const reloadData = () => {
        table.ajax.reload()
        getPaketTryout()
    }

    const exportToXlsx = () => {
        Swal.fire({
            title: 'Loading..',
            showConfirmButton: false,
        })
        authFetch(`/nilai/get-nilai-tryout/`+route.params.code).then((res) => {
          return res.json()
        }).then((js) => {
            Swal.close()
            const sports_obj = js.data
            var result = Object.keys(sports_obj).map((key) => [Number(key), sports_obj[key]]);
            var array_data = []
            result.map(function(item,index) { 
                // delete item[1].user_code;
                // item[1].Peringkat = index+1
                item[1].user_code = index+1;
                array_data.push(item[1])
            })
            if ( array_data.length > 0)
            {
                var a = [];
                function renameKeys(obj, newKeys) {
                  const keyValues = Object.keys(obj).map(key => {
                    const newKey = newKeys[key] || key;
                    return { [newKey]: obj[key] };
                  });
                  return Object.assign({}, ...keyValues);
                }
                array_data.map(function(items){
                    const obj = items;
                    const newKeys = { name: "Nama Siswa",sekolah: "Nama Sekolah",user_code:"Peringkat",total:"Total Nilai",durasi:"Lama Mengerjakan"};
                    const renamedObj = renameKeys(obj, newKeys);
                    a.push(renamedObj)
                })
                
                var title = 'Nilai '+title_tryout.value
                tsXLXS().exportAsExcelFile(a).saveAsExcelFile(title);
                // console.log(tsXLXS())
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Tidak ada data',
                })
            }
        }).catch((error) => {
            Swal.fire({
              icon: 'error',
              title: 'Server Error',
            })
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
        <v-card-item>
            <div>
                <v-card-title class="float-left text-h4" style="line-height: 3rem;">{{title_tryout}}</v-card-title>
                <div class="float-right">
                    <v-btn @click="exportToXlsx" color="#6E8A3D" class="text-white">
                        Download Laporan
                    </v-btn>
                </div>
            </div>
        </v-card-item>
        </v-col>
        </v-row>
        <v-card-text class="py-0">
            <v-row>
                <v-col col="12" sm="12" md="12" lg="12">
                    <div id="table">
                        <v-table>
                        <thead>
                          <tr id="thead-peringkat">
                          </tr>
                        </thead>
                        <tbody id="tbody-peringkat">
                          
                        </tbody>
                    </v-table>
                    </div>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>