<script setup lang="ts">
    import {
        ref,
        onMounted,
        computed,
        reactive
    } from 'vue'
    import { useRouter } from 'vue-router'
    import { authFetch } from '../../composables/useAuth'
    import Swal from 'sweetalert2'
    definePageMeta({
        middleware: ['auth']
    })
    const router = useRouter()
    let table = ref(null)
    const tableRef = ref(null)
    const formPaket = ref(null)
    let method:any = ref('')
    let disabled = ref(false)
    let dialog = ref(false)
    let dialog2 = ref(false)
    let valid = ref(true)
    let snackbar = ref(false)
    let snackbarText = ref('')
    let dataKelas = ref([])
    let formTitle = ref('')
    let formData = ref({})
    let backgroundFile:any = ref(null)
    let previewImg = ref(null)
    let photo:any = ref(null)
    let paketTryout:any[] = ref(null)
    let currentTryout:any[] = ref(null)
    let loading = ref(false)
    let searchinG = ref('')
    let items_ = ref([])
    let selected = ref([])
    let chips =  ref([])
    let item_chips = ref([])
    let membershipDurationType = reactive({
        items: [
            {
                idn: "hari",
                eng: "day"
            },
            {
                idn: "minggu",
                eng: "week"
            },
            {
                idn: "bulan",
                eng: "month"
            },
            {
                idn: "tahun",
                eng: "year"
            }
        ]
    })
    let rules = ref({
        nameRules: [
            (value: any) => !!value || 'Nama paket wajib diisi',
            (value: any) => (value && value.length >= 3) || 'Nama paket minimal 3 karakter',
        ],
        descriptionRules: [
            (value: any) => !!value || 'Deskripsi wajib diisi',
            (value: any) => (value && value.length >= 5) || 'Deskripsi minimal 5 karakter',
        ],
        durationRules: [
            (value: any) => !!value || 'Durasi wajib diisi',
            (value: any) => Number.isInteger(Number(value)) || "Durasi harus berupa angka",
        ],
        priceRules: [
            (value: any) => !!value || 'Harga paket wajib diisi'
        ],
        fileRules: [
            (value: any) => value[0].size < 1000000 || 'Images size should be less than 1 MB!'
        ]
    })
    onMounted(() => {
        sessionStorage.path = '/paket'
        const currency = (value) => {
            let val = (value/1).toFixed(2).replace('.', ',')
            return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
        }

        table = createTable(tableRef, {
            ajax: '/paket',
            filterBy: [0,1],
            order : [
                [4, 'desc'],
            ],
            columns: [
                {
                    data: "name"
                },
                {
                    data: "nama_kelas"
                },
                {
                    data: "membership_duration",
                    render: function (data, type, row, meta) {

                        if (row.membership_duration_type == null) {
                            return `${data}`
                        } else {
                            let filteredArr = membershipDurationType.items.filter((item) => {
                                return item.eng === row.membership_duration_type
                            })

                            return `${data} ${filteredArr[0].idn}`
                        }

                    }
                },
                {
                    data: "price",
                    render: function (data, type, row, meta) {
                        return `<span>Rp. `+currency(row.price)+`</span>`
                      } 
                },
                {
                    data: "created_at",
                    visible: false
                },
                {
                    data: "settings",
                    sortable: false,
                    render: function (data, type, row, meta) {
                        // return !data ? '-' : moment(data).format("DD/MM/YYYY")
                        return `
                        <div class="d-flex justify-center">
                            <div class="pa-2">
                                <button type="button" style="background-color:#E2F1FD;color:#2196F3" class="text-capitalize v-btn v-btn--elevated v-theme--light v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated detail-tryout-btn" data-code="${row.code}">
                                    Tryout (${row.count_to ? row.count_to : 0})
                                </button>
                            </div>
                            <div class="pa-2">
                                <button type="button" style="background-color:#FFE6C7;color:#FB8C00" class="text-capitalize v-btn v-btn--elevated v-theme--light v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated detail-user-btn" data-code="${row.code}">
                                    Users (${row.jumlah_daftar ? row.jumlah_daftar : 0})
                                </button>
                            </div>
                        </div>
                        `
                    }
                },
                {
                    data: "tags",
                    visible: false
                },
            ],
            rowClick: function(evt)
            {
                console.log(evt)
            }
        })
        // this.$emit('ready')
        getKelas()
    })

    /* Methods */

    /* --- Computed --- */
    const keywords = computed(() => {
        if (!searchinG.value) return []

        let keywords_ = []
        let c = searching__

        for (let search of c.value) {
            keywords_.push(search.name)
        }

        return keywords_
    })

    const searching__ = computed(() => {
        let dataTryout = items_.value

        if (!searchinG.value) return dataTryout
        let _search = searchinG.value.toString().toLowerCase()

        return dataTryout.filter( item => {
            let text = item.title.toString().toLowerCase()

            return text.indexOf(_search) > -1
        })
    })

    const allSelected = computed(() => {
        return selected.value.length === items_.value.length
    })

    const selections = computed(() => {
        let selections__ = []
        let result = []
        result = selected.value

        for (const selection of result) {
            selections__.push(selection)
        }

        return selections__
    })

    const handleClick = async (e:any) => {
        if (e.target.matches(".detail-tryout-btn")) {
            router.push({
                path: "/paket/tryout/" + e.target.dataset.code,                
            })
        } else if (e.target.matches(".detail-user-btn")) {
            router.push({
                path: "/paket/user/" + e.target.dataset.code,
            })
        } else {}
    }

    // const dataItem = () => {
    //     authFetch('/tryout')
    //         .then((res) => {
    //             return res.json()
    //         })
    //         .then((js) => {
    //             items_.value = js.data
    //         });
    // }

    const readURL = async (file:any) => {
        var reader = new FileReader()
        reader.onload = (e) => {
            // photo.value.setAttribute('src', e.target.result)
            previewImg.value = e.target.result
        }
        reader.readAsDataURL(file)
    }

    const uploadImage = (e:any) => {
        console.log('v-input',backgroundFile.value)
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
        fileData.append("subdir", "/paket/");
        fileData.append("path", "paket");
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
                
                formData.value.file_code = result.code
                formData.value.file_name = result.file_name
            }
        });
    }

    const getPaketTryout = async (code:string = '') => {
        if (code === '') {
            currentTryout.value = null
        } else {
            authFetch(`/paket/paket_tryout/${code}`)
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                currentTryout.value = js.details.data
                paketTryout.value = js.details.data
            });
        }
    }

    const getKelas = async () => {
        authFetch('/kelas')
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                let data = js.data.filter((item:any) => {
                    return item.active === 1
                })

                for (let i = 0; i < data.length; i++){
                    dataKelas.value[i] = data[i].name
                }

                // console.log('data kelas', dataKelas.value)
            });
    }

    const next = () => {
        loading.value = true

        setTimeout(() => {
            //this.search = ''
            // selected.value = []
            currentTryout.value = []
            if (paketTryout.value === null) {
                currentTryout.value = selected.value
            } else {
                let joinArr = [...paketTryout.value, ...selected.value]
                let filteredArr = joinArr.filter((item, index, self) =>
                    index === self.findIndex((val) => (
                        val.code === item.code
                    ))
                )

                currentTryout.value = filteredArr
            }
            console.log('curr tryout', currentTryout.value)

            loading.value = false
            dialog2.value = false
        }, 1000)
    }

    /* CRUD Methods */

    const reloadData = () => {
        table.ajax.reload()
    }

    const addData = () => {
        formTitle.value = 'Tambah Data Paket SSC'
        formData.value = {}
        selected.value = []
        backgroundFile.value = [
            {
                "size": 0,
                "name": '',
                "type": ''
            }
        ]
        previewImg.value = '/images/background/blog-bg-2x.jpg'
        method.value = 'POST'
        // getPaketTryout()
        disabled.value = false
        dialog.value = true
    }

    const editData = () => {
        formTitle.value = 'Edit Data Paket SSC'  
        method.value = 'PUT'
        var rows = table.rows('.selected').data()
        
        if(!rows[0]){
            snackbarText.value = 'Data belum dipilih.'
            snackbar.value = true
            return
        }
        formData.value = rows[0]
        console.log(rows[0])
        if(rows[0].tags) {
            var a = rows[0].tags
            chips.value = a.split(',');
        }

        selected.value = []
        // getPaketTryout(formData.value.uuid)
        disabled.value = false
        dialog.value = true

        if (rows[0].file_code !== null) {
            previewImg.value = rows[0].file_url
            backgroundFile.value = [
                {
                    "size": rows[0].file_size,
                    "name": rows[0].file_name,
                    "type": rows[0].file_type
                }
            ]
        } else {
            backgroundFile.value = [
                {
                    "size": 0,
                    "name": '',
                    "type": ''
                }
            ]
            previewImg.value = '/images/background/blog-bg-2x.jpg'
        }
    }
    
    const deleteData = () => {
        var rows = table.rows('.selected').data()
        if(!rows[0]){
            snackbarText.value = 'Data belum dipilih.'
            snackbar.value = true
            return
        }

        Swal.fire({
          title: 'Konfirmasi Hapus?',
          text: 'Hapus Data '+rows[0].name,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Oke',
          cancelButtonText: 'Batal',
        }).then((result) => {
          if (result.isConfirmed) {
            let paket = rows[0]
            authFetch("/paket/" + paket.uuid, {
                    method: "DELETE",
                    body: '',
            })
            .then((res) => {
                return res.json()
            })
            .then((js) => {
                table.ajax.reload()
                snackbarText.value = js.message
                snackbar.value = true
            });
          }
        })

    }

    const remove = (item:any) => {
        this.chips.splice(this.chips.indexOf(item), 1)
      }

    const submitForm = async () => {
        const formPaketRef = formPaket.value
        let status = await formPaketRef.validate()
        var a = chips.value.join()
        if(currentTryout.value !== null) {
            formData.value.group_tryout = JSON.stringify(currentTryout.value)
        }

        formData.value.tags = a

        let data = Object.keys(formData.value).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(formData.value[key])).join("&")

        if (status.valid) {
            disabled.value = true
            loading.value = true
            let urlSubmit = "/paket"
            if (method.value == "PUT") urlSubmit = "/paket/" + formData.value.uuid

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
                <v-card-title class="text-h4" style="line-height: 3rem;">Data Paket SSC</v-card-title>
            </v-card-item>
        </v-col>
        <v-col>
            <v-card-actions>
                <!-- <v-col cols="6"></v-col>
                <v-col cols="7">
                    <v-row>
                    </v-row>
                </v-col> -->
                <v-spacer></v-spacer>
                <v-btn size="small" @click="reloadData" color="surface-variant" variant="text" icon="mdi-refresh"></v-btn>
                <v-btn size="small" @click="addData" color="surface-variant" variant="text" icon="mdi-plus"></v-btn>
                <v-btn size="small" @click="editData" color="surface-variant" variant="text" icon="mdi-pencil"></v-btn>
                <v-btn size="small" @click="deleteData" color="surface-variant" variant="text" icon="mdi-delete"></v-btn>
            </v-card-actions>
        </v-col>
        </v-row>
        <v-card-text class="py-0">
            <datatable density="compact" ref="tableRef" :filter="true">
                <thead>
                    <tr>
                        <th class="text-left">
                            Nama Paket
                        </th>
                        <th class="text-left">
                            Kelas
                        </th>
                        <th class="text-left">
                            Masa Aktif
                        </th>
                        <th class="text-left">
                            Harga
                        </th>
                        <th class="text-left">
                            Created at
                        </th>
                        <th class="text-center">
                            Pengaturan
                        </th>
                        <th class="text-center">
                            Tags
                        </th>
                    </tr>
                </thead>
                <tbody @click="handleClick">
                </tbody>
            </datatable>
        </v-card-text>
        <v-row justify="center">
            <v-dialog v-model="dialog" persistent max-width="600px" scrollable>
                <v-card>
                    <v-form ref="formPaket" v-model="valid" lazy-validation>
                            <v-card-title>
                                <v-btn
                                    @click="dialog = false"
                                    icon="mdi-chevron-left"
                                    size="small"
                                    variant="text"
                                ></v-btn>
                                <span class="text-h5"> {{ formTitle }} </span>
                            </v-card-title>
                            <v-card-text>
                                <v-container>
                                    <v-row>
                                        <v-col md="12" sm="12" xs="12">
                                            <v-text-field label="Nama Paket" v-model="formData.name" :rules="rules.nameRules" clearable required></v-text-field>
                                        </v-col>
                                        <v-col md="12" sm="12" xs="12">
                                            <v-textarea clearable label="Deskripsi" variant="outlined" v-model="formData.description" :rules="rules.descriptionRules" rows="3" row-height="25"></v-textarea>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-select clearable label="Kelas"
                                                :items="dataKelas"
                                                v-model="formData.nama_kelas"
                                                >
                                            </v-select>
                                        </v-col>
                                        <v-col md="6" sm="6" xs="6">
                                            <v-text-field v-model="formData.membership_duration" :rules="rules.durationRules" label="Durasi" type="number" clearable required></v-text-field>
                                        </v-col>
                                        <v-col md="6" sm="6" xs="6">
                                            <v-select clearable label="Tipe Durasi"
                                            :items="['day', 'week', 'month', 'year']"
                                            v-model="formData.membership_duration_type"
                                            >
                                            </v-select>
                                        </v-col>
                                        <v-col md="12" sm="12" xs="12">
                                            <v-text-field v-model="formData.price" :rules="rules.priceRules" label="Harga Paket" type="number" clearable required></v-text-field>
                                        </v-col>
                                        <v-col md="12" sm="12" xs="12">
                                            <v-combobox
                                                v-model="chips"
                                                :items="item_chips"
                                                chips
                                                clearable
                                                label="Tag Paket"
                                                multiple
                                                prepend-icon="mdi-tag"
                                                variant="solo"
                                              >
                                                <template v-slot:selection="{ attrs, item, select, selected }">
                                                  <v-chip
                                                    v-bind="attrs"
                                                    :model-value="selected"
                                                    closable
                                                    @click="select"
                                                    @click:close="remove(item)"
                                                  >
                                                    <strong>{{ item }}</strong>&nbsp;
                                                    <span>(interest)</span>
                                                  </v-chip>
                                                </template>
                                              </v-combobox>
                                        </v-col>
                                        <v-col md="12" sm="12" xs="12">
                                            <v-row>
                                                <v-col md="6" sm="6" xs="6">
                                                    <v-file-input
                                                        show-size
                                                        chips
                                                        outlined
                                                        clearable
                                                        :rules="rules.fileRules" 
                                                        v-model="backgroundFile"
                                                        accept="image/png, image/jpeg, image/jpg"
                                                        placeholder="Upload background"
                                                        prepend-icon="mdi-camera"
                                                        label="Background"
                                                        @update:modelValue="uploadImage"
                                                        hint="* Gambar ukuran 3:4 dan maximal 1mb"
                                                        persistent-hint
                                                        >
                                                    </v-file-input>
                                                </v-col>
                                                <v-col md="6" sm="6" xs="6">
                                                    <span>Preview</span>
                                                    <v-img class="bg-white" width="200" :aspect-ratio="4 / 3" :src="previewImg"></v-img>

                                                </v-col>
                                            </v-row>
                                        </v-col>
                                        <v-divider></v-divider>
                                        <!-- <v-col md="12" sm="12" xs="12">
                                            <v-item-group selected-class="bg-primary">
                                                    <v-row>
                                                        <v-col
                                                        cols="12"
                                                        md="12"
                                                        sm="12"
                                                        >
                                                            <v-item-group multiple selected-class="bg-purple">
                                                                <div class="text-caption mb-2">Tryout</div>
                                                                <v-item
                                                                v-for="item in currentTryout"
                                                                :key="item"
                                                                v-slot="{ selectedClass, toggle }"
                                                                >
                                                                <v-chip
                                                                    :class="selectedClass"
                                                                    @click="toggle"
                                                                >
                                                                    {{ item.name }}
                                                                </v-chip>
                                                                </v-item>
                                                                <v-chip @click="dialog2 = true">
                                                                    +
                                                                </v-chip>
                                                            </v-item-group>
                                                        </v-col>
                                                    </v-row>
                                            </v-item-group>
                                        </v-col> -->
                                    </v-row>
                                </v-container>
                            </v-card-text>
                            <div class="px-10 pb-5 text-right">
                                <v-btn  class="mr-5" variant="tonal" color="grey" text @click="dialog = false"> Batal </v-btn>
                                <v-btn 
                                    class="text-white" color="#5C9527"
                                    :disabled="disabled"
                                    prepend-icon="mdi-content-save"
                                    :loading="loading"
                                    text @click="submitForm"> Simpan </v-btn>
                            </div>
                    </v-form>
                </v-card>
            </v-dialog>
            <!-- <v-dialog
                v-model="dialog2"
                persistent
            >
                <v-card
                    class="mx-auto"
                    max-width="450"
                >
                    <v-toolbar
                    color="primary"
                    height="88"
                    flat
                    >
                    <template v-slot:prepend v-if="false">
                        <v-btn icon="mdi-arrow-left">
                        </v-btn>
                    </template>

                    <v-text-field
                        v-model="searchinG"
                        clearable
                        hide-details
                        label="Cari Tryout"
                        prepend-inner-icon="mdi-magnify"
                        single-line
                    ></v-text-field>

                    <template v-slot:append v-if="false">
                        <v-btn icon="mdi-dots-vertical"></v-btn>
                    </template>
                    </v-toolbar>

                    <v-container>
                        <v-row
                            align="center"
                            justify="start"
                        >
                            <v-col
                                v-for="(selection, i) in selections"
                                :key="selection.title"
                                cols="auto"
                                class="py-1 pe-0">
                                <v-chip
                                    :disabled="loading"
                                    closable
                                    @click:close="selected.splice(i, 1)"
                                >

                                    {{ selection.title }}
                                </v-chip>
                            </v-col>
                        </v-row>
                    </v-container>

                    <div v-if="false" class="py-3 px-4">
                    <v-chip
                        v-for="(keyword, i) in keywords"
                        :key="i"
                        class="me-2"
                    >
                        {{ keyword }}
                    </v-chip>

                    </div>

                    <v-divider></v-divider>

                    <v-list lines="three">
                        <template v-for="(item, i) in searching__">
                            <v-list-item
                                v-if="!selected.includes(item)"
                                :key="i"
                                :disabled="loading"
                                @click="selected.push(item)">
                                <template v-slot:prepend v-if="false">
                                    <v-avatar 
                                        class="me-4 mt-2"
                                        rounded="0">
                                        <v-img :src="item.image" cover></v-img>
                                    </v-avatar>
                                </template>

                                <v-list-item-title
                                class="text-uppercase font-weight-regular text-caption"
                                v-text="item.title"
                                ></v-list-item-title>
                            </v-list-item>
                        </template>
                    </v-list>

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-spacer></v-spacer>

                        <v-btn
                            :disabled="!selected.length"
                            :loading="loading"
                            color="purple"
                            variant="text"
                            @click="next">
                            Next
                        </v-btn>
                    </v-card-actions>

                    <v-list v-if="false">
                        <template v-for="item in searching__">
                            <v-list-item
                            v-if="!selected.includes(item)"
                            :key="item.text"
                            :disabled="loading"
                            @click="selected.push(item)"
                            >
                            <template v-slot:prepend>
                                <v-icon
                                :disabled="loading"
                                :icon="item.icon"
                                ></v-icon>
                            </template>

                            <v-list-item-title v-text="item.text"></v-list-item-title>
                            </v-list-item>
                        </template>
                    </v-list>
                </v-card>
            </v-dialog> -->
        </v-row>
    </v-card>
</template>