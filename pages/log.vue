<style type="text/css">
    .v-overlay--active{
        position: fixed;
        justify-content: center;
        align-items: center
    }
</style>
<script setup lang="ts">
    import {
        ref,
        reactive,
        onMounted
    } from 'vue'
    import { useRouter } from 'vue-router'
    import { authFetch } from '../composables/useAuth'
    import moment from 'moment'
    import Swal from 'sweetalert2'
    import $ from 'jquery'
    import Datepicker from '@vuepic/vue-datepicker'
    import '@vuepic/vue-datepicker/dist/main.css'

    definePageMeta({
        middleware: ['auth']
    })
    const router = useRouter()
    let table = ref(null)
    let show = ref(false)
    let tooltip_prop = ref('')
    const isTooltipVisible = ref(false)
    const tableRef = ref(null)
    onMounted(() => {
        sessionStorage.path = '/log'
        table = createTable(tableRef, {
            ajax: '/get_data_log',
            order : [
                [4, 'desc'],
            ],
            filterBy: [0,1],
            paramData: function (d:any) {
                
                // if (!statusId.value) {
                // }
            },
            columns: [
                {
                    data: "log_name"
                },
                {
                    data: "description"
                },
                {
                    data: "user"
                },
                {
                    data: "properties",
                    sortable: false,
                    render: function (data, type, row, meta) {
                        // return !data ? '-' : moment(data).format("DD/MM/YYYY")
                        return `<div class="pa-2">
                            <button type="button" style="background-color:#D8EED9;color:#4CAF50" class="v-btn v-btn--elevated v-btn--icon v-theme--light v-btn--density-default v-btn--size-default v-btn--variant-elevated detail-prop">
                                <i class="mdi-help-circle-outline mdi v-icon notranslate v-theme--light v-icon--size-x-large detail-prop" aria-hidden="true"></i>
                            </button>
                        </div>`
                    }
                },
                {
                    data: "created_at"
                }
            ],
            rowClick: function(evt)
            {
                tooltip_prop.value = evt.data.properties
                console.log(evt)
            }
        })
        // this.$emit('ready')
    })

    const handleClick = async (e:any) => {
        if (e.target.matches(".detail-prop")) {
            show.value  = !show.value
        }
    }

</script>
<template>
    <v-card class="mx-auto">
        <v-row>
        <v-col>
            <v-card-item>
                <v-card-title class="text-h4" style="line-height: 3rem;">Data Log</v-card-title>
            </v-card-item>
        </v-col>
        <v-col>
            <v-card-actions>
            </v-card-actions>
        </v-col>
        </v-row>
        <v-card-text class="py-0">
            <datatable density="compact" ref="tableRef" :filter="true">
                <thead>
                    <tr>
                        <th class="text-left">
                            Log
                        </th>
                        <th class="text-left">
                            Deskripsi
                        </th>
                        <th class="text-left">
                            User
                        </th>
                        <th class="text-left">
                            Properti
                        </th>
                        <th class="text-left">
                            Tanggal
                        </th>
                    </tr>
                </thead>
                <tbody @click="handleClick">
                </tbody>
            </datatable>
        </v-card-text>
        <span>
             <v-overlay v-model="show">
                <v-tooltip v-model="show">
                    <span>{{ tooltip_prop }}</span>   
                </v-tooltip>
             </v-overlay>
        </span>
    </v-card>
</template>