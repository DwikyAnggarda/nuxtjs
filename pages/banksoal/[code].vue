<style>
    .v-card-actions{
        padding: 0px !important;
    }
    .row-data:hover{
        background-color:gray;
        cursor: pointer;
    }
    .layout-img{
        width: 100%;
    }
    .swal2-container {
      z-index: 100000;
    }
</style>
<script setup lang="ts">
    import {
        ref,
        reactive,
        onMounted
    } from 'vue'
    import { authFetch } from '../../composables/useAuth'
    import { postUploadAdapterPlugin, explainUploadAdapterPlugin } from '@/composables/useCustomUploadAdapterPlugin';
    import { vueRoute } from 'vue-route'
    import { vueRouter } from 'vue-router'
    import Swal from 'sweetalert2'
    import moment from 'moment'
    import Datepicker from '@vuepic/vue-datepicker'
    import '@vuepic/vue-datepicker/dist/main.css'
    import CKEditor from '@ckeditor/ckeditor5-vue'
    import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
    import SimpleUploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/simpleuploadadapter';
    // import Base64UploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/base64uploadadapter';
    
    definePageMeta({
        middleware: ['auth']
    })

    const route = useRoute()
    const router = useRouter()
    let selected_jawaban = ref('')
    const formSubtest = ref(null)
    let method = ref('')
    let lock = ref(false)
    let loading = ref(false)
    let dialog = ref(false)
    let valid = ref(true)
    let snackbar = ref(false)
    let snackbarText = ref('')
    let formTitle = ref('')
    let previewImg = ref('')
    let previewImgAnswer = ref('')
    let currentUrl = ref('')
    let previewImgAnswerRow = ref('')
    let i_filecode_question = ref('')
    let i_filename_question = ref('')
    let i_filecode_answer = ref('')
    let i_filename_answer = ref('')
    let layout = ref('')
    let editorData = ref('')
    let formData = ref({})
    const kelas = []
    const mapel = []
    let arr_obj_mapel = ref([])
    let arr_obj_kelas = ref([])
    let curr_jenis_soal = ref(null)
    let curr_mapel = ref(null)
    let curr_kelas = ref(null)

    const jenis_soal_items = [
        {text: 'Pilihan Ganda Biasa', value : 1},
        {text: 'Pilihan Ganda Kompleks', value: 2},
        {text: 'Pilihan Benar Salah',value:3}
    ]
    const src1 = '/images/background/tunggal.png'
    const src2 = '/images/background/ganda.png'

    const jenis_soal_values = []

    const singleSelect =  true
    const selected =  []
    const headers =  [
          {
            text: 'Pilihan Jawaban',
            align: 'start',
            sortable: false,
            value: 'question',
          }
        ]
    let answer_items = ref([])
    const array_answer = []
    let i_kode_soal = ref('')
    let i_pertanyaan = ref('')
    let i_jenis_soal = ref('')
    let i_mapel = ref('')
    let i_point = ref(0)
    let i_kelas = ref('')
    let i_pembahasan = ref('')
    let i_deskripsi_soal = ref('')
    let currentFile = ref({})
    let jawaban = ref('')
    let column = ref([])
    let testradio = ref('')
    let is_true = ref([])
    let jawaban_pg_biasa = ref('')
    let pembahasan = ref('')
    let backgroundFileAnswer:any = ref(null)
    let backgroundFileQuestion:any = ref(null)
    let is_true_false = ref('d-none')
    let is_img_q = ref('d-none')
    let table_pg = ref('')
    let is_edit = ref({})
    let is_pg_biasa = ref('')
    let i_syscode = ref('')
    let i_created_at = ref('')
    let i_row_id = ref(0)
    let ro_kode = ref(false)
    let rm_jawaban = ref('d-none')
    let is_pg_kompleks = ref('d-none')
    let obj_true_false = ref({})
    const editor = ClassicEditor
    const ckeditor = CKEditor.component
    // let editor = reactive(ClassicEditor)
    
    let editorConfigPost = ref({
        extraPlugins: [ postUploadAdapterPlugin ],
    })

    let editorConfigExplain = ref({
        extraPlugins: [ explainUploadAdapterPlugin ],
    })

    let rules = ref({
        kelasRules: [
            (v: any) => !!v || 'Kelas wajib diisi',
        ],
        mapelRules: [
            (v: any) => !!v || 'Mapel wajib diisi',
        ],
        jenisSoalRules: [
            (v: any) => !!v || 'Jenis Soal wajib diisi',
        ],
        layoutRules: [
            (v: any) => !!v || 'Pilihan Layout wajib diisi',
        ],
        kodeRules: [
            (v: any) => !!v || 'Kode Soal wajib diisi',
        ],
        poinRules: [
            (v: any) => !!v || 'Poin Soal wajib diisi',
        ],
        pertanyaanRules: [
            (v: any) => !!v || 'Pertanyaan wajib diisi',
        ],
        fileRules: [
            (value: any) =>  value ? value[0].size < 1000000 : '' || 'Images size should be less than 1 MB!'
        ],
        fileRulesSoal: [
            (value: any) => {
                if (!backgroundFileQuestion.value) {
                    return false
                }
                if (backgroundFileQuestion.value[0].size > 1000000) {
                    return 'Images size should be less than 1 MB!'
                }
            }
        ],
        pembahasanRules: [
            (v: any) => !!v || 'Pembahasan wajib diisi',
        ]
    })

    onMounted(() => {
        sessionStorage.path = '/banksoal/detail'
        if(route.params.code != 'tambah') {
            method.value = 'PUT'
            ro_kode.value = true
            authFetch(`/banksoal/read_table_kelas`).then((res) => {
                return res.json()
            }).then((js) => {
                js.map(function(item){
                    var a = {text: item.code+' - '+item.name, value:item.id}
                    kelas.push(a)
                })
                kelas.map(function(obj){
                    arr_obj_kelas.value.push(obj)
                })
            })

            authFetch(`/banksoal/read_table_mapel`).then((res) => {
                return res.json()
            }).then((js) => {
                js.map(function(item){
                    var a = {text: item.code+' - '+item.name,value: item.id}
                    mapel.push(a)
                })
                mapel.map(function(obj){
                    arr_obj_mapel.value.push(obj)
                })
            })
            authFetch(`/banksoal/get_detail_soal/`+route.params.code).then((res) => {
                return res.json()
            }).then((js) => {
                js.soal.map(function(item){
                    console.log(item)
                    i_row_id.value = item.id
                    i_mapel.value = item.mapel_id
                    i_kelas.value = item.kelas_id
                    i_jenis_soal.value = item.type
                    i_syscode.value = item.syscode
                    i_created_at.value = item.created_at
                    i_kode_soal.value = item.code
                    if (item.type == 3) {
                        curr_jenis_soal.value = {text: 'Pilihan Benar Salah', value : 3}
                        is_true_false.value = 'd-block'
                        is_pg_biasa.value = 'd-none'
                        is_pg_kompleks.value = 'd-none'
                    }else if (item.type == 2) {
                        curr_jenis_soal.value = {text: 'Pilihan Ganda Kompleks', value : 2}
                        is_true_false.value = 'd-none'
                        is_pg_biasa.value = 'd-none'
                        is_pg_kompleks.value = 'd-block'
                    } else {
                        curr_jenis_soal.value = {text: 'Pilihan Ganda Biasa', value : 1}
                        is_true_false.value = 'd-none'
                        is_pg_biasa.value = 'd-block'
                        is_pg_kompleks.value = 'd-none'
                    }
                    curr_kelas.value = {text: item.ckelas+' - '+item.kelas, value:item.kelas_id}
                    curr_mapel.value = {text: item.cmapel+' - '+item.mapel, value:item.mapel_id}
                    i_point.value = item.point
                    layout.value = item.layout
                    backgroundFileQuestion.value = [
                        {
                            "size": 0,
                            "name": item.image_name,
                            "type": ''
                        }
                    ]
                    i_deskripsi_soal.value = item.description
                    i_pertanyaan.value = item.question
                    i_pembahasan.value = item.explanation
                    if (item.url) {
                        is_img_q.value = ('d-flex')
                        previewImg.value = item.url
                    }
                })
                var aa = {}
                js.jawaban.map(function(items){
                    var jawaban_true_false = ''
                    var jawaban_kompleks = 0
                    aa[items.id] = 'Benar'
                    // answer_items.value[index].jawaban_true_false = value
                    if(items.correct == 1){
                        if(curr_jenis_soal.value.value == 1) {
                            selected_jawaban.value = items.id
                            jawaban_pg_biasa.value = items.id
                        } else if(curr_jenis_soal.value.value == 2) {
                            jawaban_kompleks = items.id
                            is_true.value.push(items.id)
                        } else {
                            aa[items.id] = 'Benar'
                            jawaban_true_false = 'benar'
                        }
                    } else {
                        aa[items.id] = 'Salah'
                    }
                    const editedItem = [{'name' : items.answer,id:items.id,'filename' : items.image_name,'filecode' : items.image_code,'file' : currentFile.value,'url' : items.url,'jawaban_kompleks' : jawaban_kompleks,'jawaban_true_false' : jawaban_true_false}]
                    answer_items.value = [...answer_items.value,...editedItem]
                    console.log(answer_items.value)
                })
                column.value = aa
            })
        }

        else {
            authFetch(`/banksoal/read_table_kelas`).then((res) => {
                return res.json()
            }).then((js) => {
                js.map(function(item){
                    var a = {text: item.code+' - '+item.name, value:item.id}
                    kelas.push(a)
                })
                kelas.map(function(obj){
                    arr_obj_kelas.value.push(obj)
                })
            })

            authFetch(`/banksoal/read_table_mapel`).then((res) => {
                return res.json()
            }).then((js) => {
                js.map(function(item){
                    var a = {text: item.code+' - '+item.name,value: item.id}
                    mapel.push(a)
                })
                mapel.map(function(obj){
                    arr_obj_mapel.value.push(obj)
                })
            })

            method.value = 'POST'
        }

    })
    const jenissoalchange = (value:any) => {
        i_jenis_soal.value = value
        if (value == 3) { 
            is_true_false.value = 'd-block'
            is_pg_biasa.value = 'd-none'
            is_pg_kompleks.value = 'd-none'
        } else if (value == 1) {
            is_true_false.value = 'd-none'
            is_pg_biasa.value = 'd-block'
            is_pg_kompleks.value = 'd-none'
        } else{
            is_true_false.value = 'd-none'
            is_pg_biasa.value = 'd-none'
            is_pg_kompleks.value = 'd-block'
        } 
    }

    const save_kelas = (value:any) => {
        i_kelas.value = value
    }

    const save_mapel = (value:any) => {
        i_mapel.value = value
    }

    const handleClick = (value:any) => {
        console.log(i_deskripsi_soal.value)
        currentFile.value = {}
        rm_jawaban.value = 'd-block'
        dialog.value = true
        jawaban.value = value.name
        previewImgAnswer.value = value.url
        is_edit.value = {
            'status' : true,
            'jawaban' : value.name,
            'id' : value.id
        }
    }

    const radiobuttonchange = (value:any) => {
        var obj = {'jawaban' : value};
        var index = answer_items.value.map(i => i.id).indexOf(value.id)
        answer_items.value[index].jawaban_true_false = value.value
        console.log(answer_items)
    }

    const is_true_biasa = (val:any) => {
        jawaban_pg_biasa.value = val.toString()
    }

    const is_true_kompleks = (value:any) => {
        var index = answer_items.value.findIndex(p => p.id == value)
        console.log('index',index)
        console.log('id',answer_items.value[index].jawaban_kompleks)
        if (answer_items.value[index].jawaban_kompleks) {
            if(answer_items.value[index].jawaban_kompleks != 0){
                answer_items.value[index].jawaban_kompleks = 0
            }else{
                answer_items.value[index].jawaban_kompleks = value
            }
            console.log('test')
        } else {
            answer_items.value[index].jawaban_kompleks = value
        }
        console.log(answer_items.value)
    }

    const readURL = async (file:any) => {
        var reader = new FileReader()
        reader.onload = (e) => {
            previewImg.value = e.target.result
        }
        reader.readAsDataURL(file)
    }

    const readURLanswer = async (file:any) => {
        var reader = new FileReader()
        reader.onload = (e) => {
            currentUrl.value = e.target.result
            previewImgAnswer.value = e.target.result
        }
        reader.readAsDataURL(file)
    }

    const uploadImage = (e:any) => {
        is_img_q.value = 'd-block'
        let file:any = e.length > 0 ? e[0] : null
        readURL(file)

        if (file !== null && file.size < 1000000) {
            saveFile(file)
        }
    }

    const uploadImageAnswer = (e:any) => {
        let file:any = e.length > 0 ? e[0] : null
        console.log(file)
        readURLanswer(file)

        if (file !== null && file.size < 1000000) {
            saveFileAnswer(file)
        }
    }

    const saveFileAnswer = async (file:any) => {
        var fileData = new FormData();
        fileData.append("files", file);
        console.log(file, formData)
        fileData.append("subdir", "/answers/");
        fileData.append("path", "answers");
        Swal.fire({
          title: 'Proses Upload',
          text: 'Loading',
          showConfirmButton: false,
        })

        authFetch("/upload", {
            method: "POST",
            body: fileData,
            headers: {
                "Content-Type": null,
            },
        })
        .then((res) => {
            if (res.status === 201) {
            } else if (res.status === 400) {
            }
            return res.json();
        })
        .then((js) => {
            Swal.close()
            console.log(js.files[0])
            if (js.files[0].status == false) {
                previewImgAnswer.value = '';
                Swal.fire({
                  icon: 'error',
                  title: 'Upload Gagal',
                  text: js.files[0].error,
                  buttons: false
                })
            } else {
                Swal.fire({
                  icon: 'success',
                  title: 'Upload Sukses',
                  text: 'Sukses',
                  buttons: false
                })
                let result = js.files[0]
                i_filecode_answer.value = result.code
                i_filename_answer.value = result.file_name
                currentFile.value = file
            }
        });
    }

    const saveFile = async (file:any) => {
        var fileData = new FormData();
        fileData.append("files", file);
        console.log(file, formData)
        fileData.append("subdir", "/questions/");
        fileData.append("path", "questions");
        Swal.fire({
          title: 'Proses Upload',
          text: 'Loading',
          showConfirmButton: false,
        })
        authFetch("/upload", {
            method: "POST",
            body: fileData,
            headers: {
                "Content-Type": null,
            },
        })
        .then((res) => {
            if (res.status === 201) {
            } else if (res.status === 400) {
            }
            return res.json();
        })
        .then((js) => {
            Swal.close()
            console.log(js.files[0])
            if (js.files[0].status == false) {
                previewImg.value = '';
                Swal.fire({
                  icon: 'error',
                  title: 'Upload Gagal',
                  text: js.files[0].error,
                  buttons: false
                })
            } else {
                Swal.fire({
                  icon: 'success',
                  title: 'Upload Sukses',
                  text: 'Sukses',
                  buttons: false
                })
                let result = js.files[0]
                i_filecode_question.value = result.code
                i_filename_question.value = result.file_name
            }
        });
    }

    const closeModal = () => {
        currentFile.value = {}
        dialog.value = false 
        is_edit.value = false
    }

    const addData = () => {
        rm_jawaban.value = 'd-none'
        formTitle.value = 'Tambah Jawaban'
        formData.value = {}
        dialog.value = true
        jawaban.value = ''
        previewImgAnswer.value = ''
        currentFile.value = {}
    }

    const tambahJawaban = (test) => {
        if (test.status === true){
            console.log('edit')
            var index = answer_items.value.map(i => i.id).indexOf(test.id)
            answer_items.value[index] = {
                'name':jawaban.value,
                id:test.id,
                'filename' : i_filename_answer.value,
                'filecode' : i_filecode_answer.value,
                'url' : currentUrl.value};
            console.log(answer_items.value)
            is_edit.value = false
        } else {
            console.log('tambah')
            const aa = jawaban.value
            const editedItem = [{'name' : aa,id:new Date().getTime(),'filename' : i_filename_answer.value,'filecode' : i_filecode_answer.value,'url' : currentUrl.value}]
            answer_items.value = [...answer_items.value,...editedItem]
            console.log(answer_items.value)
        }
        is_edit.value = false
        dialog.value = false
        jawaban.value = ''
        i_filename_answer.value = ''
        i_filecode_answer.value = ''
        previewImgAnswer.value = ''
        currentUrl.value = {}
    }

    const hapusJawaban = (test) => {
        var index = answer_items.value.map(i => i.id).indexOf(test.id)
        answer_items.value.splice(index, 1);
        console.log(answer_items.value)
        dialog.value  = false
        is_edit.value = false
    }


    const back = () => {
        router.push({
            path : "/banksoal"
        })
    }

    const submit = async () => {
        const formSubtestRef = formSubtest.value
        let status = await formSubtestRef.validate()
        loading.value = true
        lock.value = true;
        console.log(method.value)
        const jawaban = [{
            'item_jawaban' : answer_items.value,
            'pg_biasa' : jawaban_pg_biasa.value
        }]

        const payloadData = {
            row_id: i_row_id.value,
            code: i_kode_soal.value,
            syscode: i_syscode.value,
            created_at: i_created_at.value,
            jenis_soal: i_jenis_soal.value,
            mapel: i_mapel.value,
            kelas: i_kelas.value,
            point: i_point.value,
            filecode_pertanyaan: i_filecode_question.value,
            filename_pertanyaan: i_filename_question.value,
            deskripsi: i_deskripsi_soal.value,
            pembahasan: i_pembahasan.value,
            pertanyaan: i_pertanyaan.value,
            layout : layout.value,
            jawaban:JSON.stringify(jawaban)
        }

        console.log(payloadData)
        console.log(jawaban)
        var cek_jawaban = 0
        jawaban[0].item_jawaban.map(function(item){
            console.log(item)
            if(i_jenis_soal.value == 2) {
                if(item.jawaban_kompleks > 0) {
                    cek_jawaban++
                }
            } else if(i_jenis_soal.value == 3) {
                if (item.jawaban_true_false) {
                    cek_jawaban++
                } else {
                    cek_jawaban = 0
                }
            } else {
                if (item.id == jawaban[0].pg_biasa) {
                    cek_jawaban++
                }
            }
        })
        if(cek_jawaban == 0){
            Swal.fire({
              title: 'Gagal Submit',
              text: 'Tambahkan Jawaban Terlebih Dahulu',
              icon: 'error'
            })
            lock.value = false
            loading.value = false
            return false
        }
        if(!i_pembahasan.value){
            Swal.fire({
              title: 'Gagal Submit',
              text: 'Pembahasan Wajib diisi',
              icon: 'error'
            })
            lock.value = false
            loading.value = false
            return false
        }
        let data = Object.keys(payloadData).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(payloadData[key])).join("&")
        if(status.valid){
            answer_items.value.map(function(item){
                delete item.url
            })
            let urlSubmit = "/banksoal"
            if (method.value == "PUT") urlSubmit = "/banksoal/" + i_syscode.value

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
                let errors = []
                if (!js.success) {
                    // console.log(js.details)
                    for (var key in js.details) {
                        if (js.details.hasOwnProperty(key)) {
                            console.log(errors.push(js.details[key]))
                        }
                    }
                    loading.value = false
                    lock.value = false
                    return;
                }
                snackbarText.value = js.message
                snackbar.value = true
                loading.value = false
                Swal.fire({
                  title: 'Sukses',
                  text: 'Soal berhasil disimpan',
                  icon: 'success'
                }).then((ok) => { 
                    if (ok.isConfirmed) { 
                        router.push({
                            path : "/banksoal"
                        })
                    }
                })
            })
        }
        else {
            loading.value = false
            lock.value = false
        }
    }

</script>
<template>
    <v-card class="mx-auto">
        <v-card-title>
            Buat Soal
        </v-card-title>
        <v-card-text >
            <v-form ref="formSubtest" v-model="valid">
                <v-container>
                    <v-row>
                        <v-col cols="6">
                            <v-text-field class="d-none" v-model="i_row_id"></v-text-field>
                            <v-text-field v-model="i_kode_soal" label="Kode Soal" :rules="rules.kodeRules" :readonly="ro_kode"></v-text-field>
                            <v-select :rules="rules.jenisSoalRules" v-model="curr_jenis_soal" @update:modelValue="jenissoalchange" item-value="value" item-title="text" :items="jenis_soal_items" label="Jenis Soal" ></v-select>
                            <v-select v-model="curr_mapel" :items="arr_obj_mapel" @update:modelValue="save_mapel" item-value="value" item-title="text" label="Mata Pelajaran" outlined :rules="rules.mapelRules" required></v-select>
                            <v-select v-model="curr_kelas" :items="arr_obj_kelas" item-value="value" item-title="text" @update:modelValue="save_kelas" :rules="rules.kelasRules" label="Kelas" outlined ></v-select>
                            <v-text-field v-model="i_point" :rules="rules.poinRules" label="Poin Soal"></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-radio-group v-model="layout" :rules="rules.layoutRules" inline>
                                <v-col cols="6">
                                    <v-radio label="Layout Tunggal" value='1' ></v-radio>
                                    <img class="layout-img" :src="src1" />
                                </v-col>
                                <v-col cols="6">
                                    <v-radio label="Layout Ganda" value='2' ></v-radio>
                                    <img class="layout-img" :src="src2" />
                                </v-col>
                            </v-radio-group>
                        </v-col>
                    </v-row>
                    <v-row style="height:100%">
                        <v-col cols="12" md="12">
                            <p>Deskripsi Soal</p>
                            <ckeditor v-model="i_deskripsi_soal" :editor="editor" :config="editorConfigPost"></ckeditor>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="6">
                            <v-text-field v-model="i_pertanyaan" :rules="rules.pertanyaanRules" label="Pertanyaan"></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <div :class="is_img_q">
                                <v-img class="bg-white mx-auto" style="width:70%" :aspect-ratio="4 / 3" :src="previewImg"></v-img>
                            </div>
                            <v-file-input 
                                prepend-icon="mdi-camera"
                                accept="image/png, image/jpeg, image/jpg"
                                placeholder="Upload background" 
                                label="Gambar Pertanyaan"
                                v-model="backgroundFileQuestion"
                                :rules="rules.fileRulesSoal"
                                hint="* Gambar max 1mb"
                                persistent-hint
                                @update:modelValue="uploadImage">        
                            </v-file-input>
                        </v-col>
                    </v-row>
                    <v-col>
                        <v-card-actions>
                            <p>Opsi Jawaban</p>
                            <v-spacer></v-spacer>
                            <v-btn size="small" @click="addData" color="surface-variant" variant="text" icon="mdi-plus"></v-btn>
                        </v-card-actions>
                    </v-col>
                    <v-row style="height:100%">
                        <v-col cols="12" md="12">
                            <v-table class="tb-pg" :class="table_pg" v-model="jawaban">
                                <thead>
                                <tr>
                                    <th class="text-left">
                                    Pilihan Jawaban
                                    </th>
                                    <th class="text-left" style="width:15%">
                                    Jawaban
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr
                                    v-for="item in answer_items"
                                    :key="item.name"
                                    class="row-data"
                                >
                                    <td @click="handleClick(item)">
                                        <v-row>
                                            <v-col cols="4">
                                                <v-img class="bg-white" width="200" :aspect-ratio="4 / 3" :src="item.url"></v-img>
                                            </v-col>
                                            <v-col style="width: 600px" cols="8">
                                                {{ item.name }}    
                                            </v-col>
                                        </v-row>
                                    </td>
                                    <td>
                                        <div :class="is_pg_kompleks">
                                            <v-checkbox :value='item.id' @change="is_true_kompleks(item.id)" v-model="is_true"></v-checkbox>
                                        </div>
                                        <div :class="is_pg_biasa">
                                            <v-radio-group v-model="selected_jawaban" row>
                                                <v-radio label="" :value='item.id' @change="is_true_biasa(item.id)" ></v-radio>
                                            </v-radio-group>
                                        </div>
                                        <div :class="is_true_false">
                                            <v-radio-group v-model="column[item.id]" inline>
                                                <v-radio @change="radiobuttonchange({'value' : 'benar','id' : item.id})" label="Benar" v-model="testradio" value="Benar"></v-radio>
                                                <v-radio @change="radiobuttonchange({'value' : 'salah','id' : item.id})" label="Salah" v-model="testradio" value="Salah"></v-radio>
                                            </v-radio-group>
                                        </div>
                                    </td>
                                </tr>
                                </tbody>
                            </v-table>
                        </v-col>
                    </v-row>
                    <v-row style="height:100%">
                        <v-col cols="12" md="12">
                            <p>Pembahasan</p>
                            <ckeditor v-model="i_pembahasan" :rules="rules.pembahasanRules" :editor="editor" required :config="editorConfigExplain"></ckeditor>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="px-10 pb-5 text-right">
                            <v-btn class="mx-2" @click="back" depressed variant="tonal" color="grey">Kembali</v-btn>
                            <v-btn @click="submit" depressed class="text-white" color="#5C9527" :loading="loading" :disabled="lock">Simpan</v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-form>
        </v-card-text>
        <v-row justify="center">
            <v-dialog v-model="dialog" persistent max-width="450px">
                <v-form @submit.prevent="tambahJawaban(is_edit)" lazy-validation>
                    <v-card>
                        <v-card-title>
                        <span class="text-h5"> {{ formTitle }} </span>
                        </v-card-title>
                        <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col>
                                    <v-text-field v-model="jawaban" label="Jawaban"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="8">
                                    <v-file-input 
                                    prepend-icon="mdi-camera"
                                    accept="image/png, image/jpeg, image/jpg"
                                    placeholder="Upload background" 
                                    label="Gambar Jawaban"
                                    :rules="rules.fileRules"
                                    v-model="backgroundFileAnswer"
                                    hint="* Gambar max 1mb"
                                    persistent-hint
                                    @update:modelValue="uploadImageAnswer"></v-file-input>
                                </v-col>
                                <v-col cols="4">
                                    <v-img class="bg-white" width="200" :aspect-ratio="4 / 3" :src="previewImgAnswer"></v-img>
                                </v-col>
                            </v-row>
                        </v-container>
                        </v-card-text>
                        <v-card-actions style="padding: 10px !important;">
                            <v-spacer></v-spacer>
                            <v-btn variant="tonal" color="grey" @click="closeModal"> Batal </v-btn>
                            <v-btn style="background-color: #5C9527;color: white;" text @click="tambahJawaban(is_edit)"> Tambah </v-btn>
                            <v-btn color="red darken-1" :class="rm_jawaban" text @click="hapusJawaban(is_edit)"> Hapus Jawaban 
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-form>
            </v-dialog>
        </v-row>
    </v-card>
</template>