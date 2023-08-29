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
</style>
<script setup lang="ts">
    import {
        ref,
        reactive,
        onMounted
    } from 'vue'
    import { authFetch } from '../../composables/useAuth'
    import { learningUploadAdapterPlugin } from '@/composables/useCustomUploadAdapterPlugin';
    import { vueRoute } from 'vue-route'
    import { vueRouter } from 'vue-router'
    import moment from 'moment'
    import Swal from 'sweetalert2'
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
    const formSubtest = ref(null)
    let method = ref('')
    let valid = ref(true)
    let lock = ref(false)
    let loading = ref(false)
    let dialog = ref(false)
    let snackbar = ref(false)
    let snackbarText = ref('')
    let formData = ref({})
    let previewImg = ref('')
    
    let i_filename = ref('')
    const kelas = []
    const mapel = []
    let arr_obj_mapel = ref([])
    let arr_obj_kelas = ref([])
    let curr_mapel = ref({text: '', value:0})
    let curr_kelas = ref({text: '', value:0})
    let imageTutor = ref('/images/tutor1.png')
    let imageTutor2 = ref('/images/tutor2.png')
    let i_syscode = ref('')
    let is_img = ref('d-none')
    let i_judul = ref('')
    let i_kode_materi = ref('')
    let i_materi = ref('')
    let i_status = ref(true)
    let i_mapel = ref('')
    let i_kelas = ref('')
    let i_row_id = ref(0)
    let ro_kode = ref(false)
    let i_link = ref('')
    let backgroundFile:any = ref(null)
    
    const editor = ClassicEditor
    const ckeditor = CKEditor.component
    let editorConfigLearning = ref({
        extraPlugins: [ learningUploadAdapterPlugin ],
    })

    let rules = ref({
        fileRules: [
            (value: any) => value[0].size < 1000000 || 'Images size should be less than 1 MB!'
        ]
    })

    onMounted(() => {
        sessionStorage.path = '/materi/detail'
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
            authFetch(`/materi/get_detail_materi/`+route.params.code).then((res) => {
                return res.json()
            }).then((js) => {
                i_row_id.value = js[0].id
                i_mapel.value = js[0].mapel_id
                i_kelas.value = js[0].kelas_id
                i_judul.value = js[0].judul
                i_syscode.value = js[0].syscode
                i_kode_materi.value = js[0].code
                curr_kelas.value = {text: js[0].ckelas+' - '+js[0].kelas, value:js[0].kelas_id}
                curr_mapel.value = {text: js[0].cmapel+' - '+js[0].mapel, value:js[0].mapel_id}
                i_link.value = js[0].link
                i_materi.value = js[0].materi
                if(js[0].status == 1) {
                    i_status.value = true
                } else {
                    i_status.value = false
                }
                if (js[0].image_name) {
                    is_img.value = ('d-flex')
                    previewImg.value = js[0].image_name
                    i_filename.value = js[0].file_name
                    backgroundFile.value = [
                        {
                            "size": 0,
                            "name": js[0].file_name,
                            "type": ''
                        }
                    ]
                }
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

            backgroundFile.value = [
                {
                    "size": 0,
                    "name": '',
                    "type": ''
                }
            ]
        }

    })

    const readURL = async (file:any) => {
        var reader = new FileReader()
        reader.onload = (e) => {
            previewImg.value = e.target.result
        }
        reader.readAsDataURL(file)
    }

    const uploadImage = (e:any) => {
        is_img.value = 'd-block'
        let file:any = e.length > 0 ? e[0] : null
        readURL(file)

        if (file !== null && file.size < 1000000) {
            saveFile(file)
        }
    }

    const saveFile = async (file:any) => {
        var fileData = new FormData();
        fileData.append("files", file);
        console.log(file, formData)
        fileData.append("subdir", "/learnings/");
        fileData.append("path", "learnings");
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
                
                i_filename.value = result.file_name
            }
        });
    }

    const save_kelas = (value:any) => {
        i_kelas.value = value
    }

    const save_mapel = (value:any) => {
        i_mapel.value = value
    }

    const back = () => {
        router.push({
            path : "/materi"
        })
    }

    const submit = async () => {
        lock.value = true;
        loading.value = true;
        console.log(method.value)
        console.log('stat',i_status.value)
        const payloadData = {
            row_id: i_row_id.value,
            code: i_kode_materi.value,
            syscode: i_syscode.value,
            judul: i_judul.value,
            mapel: i_mapel.value,
            kelas: i_kelas.value,
            link: i_link.value,
            materi: i_materi.value,
            status: i_status.value,
            image: i_filename.value
        }

        console.log(payloadData)
        let data = Object.keys(payloadData).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(payloadData[key])).join("&")

            let urlSubmit = "/materi"
            if (method.value == "PUT") urlSubmit = "/materi/" + i_syscode.value

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
                lock.value = false
                loading.value = false
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
                // Swal.close()
                snackbarText.value = js.message
                snackbar.value = true
                router.push({
                    path : "/materi"
                })
            })
    }

</script>
<template>
    <v-card class="mx-auto">
        <v-card-title>
            Form Materi
        </v-card-title>
        <v-card-text >
            <v-form ref="formSubtest" v-model="valid">
                <v-container>
                    <v-row>
                        <v-col cols="6">
                            <v-text-field class="d-none" v-model="i_row_id"></v-text-field>
                            <v-text-field v-model="i_kode_materi" label="KODE MATERI" :readonly="ro_kode"></v-text-field>
                            <v-text-field v-model="i_judul" label="JUDUL"></v-text-field>
                            <v-select v-model="curr_mapel" :items="arr_obj_mapel" @update:modelValue="save_mapel" item-value="value" item-title="text" label="MATA PELAJARAN" outlined ></v-select>
                            <v-select v-model="curr_kelas" :items="arr_obj_kelas" item-value="value" item-title="text" @update:modelValue="save_kelas" label="KELAS" outlined ></v-select>
                            <v-row>
                                <v-text-field v-model="i_link" class="mr-3" label="LINK VIDEO"></v-text-field><v-btn icon="mdi-information-outline" color="blue-grey-lighten-3" class="my-2" size="small" @click="dialog = true"></v-btn>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-file-input 
                                        :rules="rules.fileRules"
                                        hint="* Gambar max 1mb"
                                        persistent-hint
                                        prepend-icon="mdi-camera"
                                        accept="image/png, image/jpeg, image/jpg"
                                        placeholder="Upload Gambar" 
                                        label="Upload Gambar"
                                        v-model="backgroundFile"
                                        @update:modelValue="uploadImage">
                                    </v-file-input>
                                </v-col>
                                <v-col :class="is_img_q" cols="6">
                                    <v-img class="bg-white mx-auto" style="width:70%" :aspect-ratio="4 / 3" :src="previewImg"></v-img>
                                </v-col>
                            </v-row>
                        </v-col>                        
                    </v-row>
                    <v-row style="height:100%">
                        <v-col cols="12" md="12">
                            <p>MATERI</p>
                            <ckeditor v-model="i_materi" :editor="editor" :config="editorConfigLearning"></ckeditor>
                        </v-col>
                        <v-col cols="12" md="12">
                            <p>ACTIVE</p>
                            <v-switch
                              v-model="i_status"
                              color="success"
                              hide-details
                            ></v-switch>
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
            <v-dialog v-model="dialog" scrollable max-width="750px">
                <v-card>
                    <v-card-title>
                        <span class="text-h5"> Cara Upload Link Video Youtube </span>
                    </v-card-title>
                    <v-card-text>
                        <v-container>
                            <h4 class="text-h6">1. Klik tombol share</h4>
                            <v-img class="bg-white mb-3"
                            :src="imageTutor"
                            ></v-img>

                            <h4 class="text-h6">2. Copy link yang ada pada kotak merah</h4>
                            <v-img class="bg-white"
                            :src="imageTutor2"
                            ></v-img>
                        </v-container>
                    </v-card-text>
                    <v-card-actions style="padding: 10px !important;">
                        <v-spacer></v-spacer>
                        <v-btn variant="tonal" color="grey" text @click="dialog = false"> Batal </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
    </v-card>
</template>