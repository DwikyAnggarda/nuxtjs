<template>
    <div id="app">
        <v-card class="mx-auto">
            <v-card-title class="text-h4" style="line-height: 3rem;">Import user RCU</v-card-title>
            <v-card-text>
                <div class="mb-4 mt-2">
                    <v-btn color="green darken-1" style="text-transform: none;" @click="downloadTemplate"> Template Import</v-btn>
                </div>
                <file-pond
                    name="test"
                    ref="pond"
                    class-name="my-pond"
                    label-idle="Drop files here..."
                    acceptedFileTypes= "application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .xlsx"
                    v-bind:files="myFiles"
                    v-on:init="handleFilePondInit"
                />
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="submitForm" :disabled="disabled"> Save </v-btn>
            </v-card-text>
        </v-card>
    </div>
    <div v-if="showHideSpinner" class="clock-loader"></div>
    <v-overlay v-model="overlay" :persistent="true"></v-overlay>
</template>

<script lang="ts">
    import { authFetch } from '../../composables/useAuth'
    import $ from 'jquery'
    import Swal from 'sweetalert2'
    // Import FilePond
    import vueFilePond from 'vue-filepond';

    // Import plugins
    import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
    import FilePondPluginFileEncode from 'filepond-plugin-file-encode';

    // Import styles
    import 'filepond/dist/filepond.min.css';

    // Create FilePond component
    const FilePond = vueFilePond(FilePondPluginFileValidateType, FilePondPluginFileEncode);

    sessionStorage.path = '/siswa-rcu/import'

    export default {
        name: 'app',
        data: function () {
            return { myFiles: [], disabled: false, showHideSpinner: false, overlay: false };
        },
        methods: {
            handleFilePondInit: function () {
                console.log('FilePond has initialized');

                // example of instance method call on pond reference
                this.$refs.pond.getFiles();
            },
            submitForm: async function (ev:any) {
                var self = this;
                const e = this.$refs;
                let fileData = this.$refs.pond.getFiles();
                // console.log('files', fileData[0].source);
                // return;

                var urlSubmit = "/import/siswa_rcu";

                var formData = new FormData();
                    formData.append('files', fileData[0].source);

                this.disabled = true;
                Swal.fire({
                    title: "Simpan?",
                    showCancelButton: true,
                    confirmButtonText: `Ya`,
                    cancelButtonText: "Tidak",
                }).then((result) => {
                // this.loadingContent = true;
                /* Read more about isConfirmed, isDenied below */
                    if (result.isConfirmed) {
                        this.showHideSpinner = true 
                        this.overlay = true
                        authFetch(urlSubmit, {
                            method: "POST",
                            body: formData,
                            headers: {
                            'Content-Type': null,
                            },
                        })
                        .then((res) => {
                            if (res.status === 201) {
                            } else if (res.status === 400) {
                            } else if (res.status === 500){
                                Swal.fire("Timeout!", ``, "error");
                                this.disabled = false;
                                this.showHideSpinner = false 
                                this.overlay = false
                            }
                            return res.json();
                        })
                        .then((js) => {
                            this.showHideSpinner = false 
                            this.overlay = false
                            this.disabled = false;
                            if (js.success) {
                                this.$refs.pond.removeFile();
                                Swal.fire("Proses Berhasil", ``, "success");
                            } else {
                                this.$refs.pond.removeFile();
                                Swal.fire("Proses Gagal", `Gagal import siswa. Mohon dicek kembali apakah sudah pernah ada datanya atau belum.`, "error");
                            }
                        });
                    }
                });

                ev.preventDefault();
            },
            downloadTemplate () {
                this.showHideSpinner = true 
                this.overlay = true
                authFetch('/download/download_template_siswa_rcu', {
                    method: "GET",
                    responseType: 'arraybuffer'
                })
                .then((res) => {
                    if (res.status === 201) {
                    } else if (res.status === 400) {
                    } else if (res.status === 500){
                        Swal.fire("Timeout!", ``, "error");
                        this.disabled = false;
                        this.showHideSpinner = false 
                        this.overlay = false
                    }
                    return res.arrayBuffer()
                })
                .then((response) => {
                    this.showHideSpinner = false 
                    this.overlay = false
                    const url = URL.createObjectURL(new Blob([response]))
                    const link = document.createElement('a')
                    link.href = url
                    link.download = 'siswa-rcu-import.xlsx';
                    link.click()
                });
            }
        },
        components: {
            FilePond,
        },
    };
</script>