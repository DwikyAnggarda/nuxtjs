<template>
    <div>
        <div class="v-row" v-if="filter">
            <div class="v-col-md-2 v-col-6">
                <v-select @update:modelValue="change" variant="solo" v-model="numDisplay" label="Jumlah Baris" :items="['10', '50', '100', '1000']">
                </v-select>
            </div>
            <div class="v-col-6 offset-md-4">
                <v-form v-model="valid" @submit.prevent="searchData">
                    <v-row>
                        <!--<v-col cols="5">
                            <v-select v-model="select" :items="items" item-title="state" item-value="abbr"
                                label="Kategori"></v-select>
                        </v-col>-->

                        <v-col md="12" sm="12">
                            <div class="d-flex flex-row">
                                <v-text-field class="input-search-datatable" @input="onInput" v-model="keyword" variant="solo" label="Kata kunci" required></v-text-field>
                                <div class="ml-2 d-none d-sm-flex">
                                    <v-btn @click.prevent="searchData" style="height:55px;" rounded="lg" class="text-white search-datatable" icon="mdi-magnify" color="#6E8A3D"></v-btn>
                                </div>
                            </div>
                        </v-col>
                    </v-row>
                </v-form>
            </div>
        </div>
        <table ref="tableRef" :id="id" style="min-height:200px;">
            <slot />
        </table>
    </div>
</template>
<script lang="ts">
    import {
        ref,
        onMounted
    } from 'vue';
    import $ from 'jquery';

    //const props = defineProps(['size'])
    export default {
        props: {
            options: Object, 
            filter: Boolean,
            id: { default: '', type: String }
        },
        setup(props:any){
            const tableRef = ref(null);
            onMounted(() => {
            });
            const filter = props.filter;
            return { tableRef, filter };
        },
        data() {
            return {
                numDisplay: 10,
                select: {
                    state: 'Florida',
                    abbr: 'FL'
                },
                keyword: ''
            }
        },
        methods:{
            searchData: function()
            {
                $(this.tableRef).dataTable().fnDraw();
            },
            onInput: function(input)
            {
                var dtApi = $(this.tableRef).dataTable().api();
                dtApi.search(this.keyword);
            },
            change: function(data)
            {
                var t = $(this.tableRef).dataTable();
                var oSettings = t.fnSettings();

                oSettings._iDisplayLength = parseInt(data, 10);
                t._fnCalculateEnd( oSettings );

                /* If we have space to show extra rows (backing up from the end point - then do so */
                if ( oSettings.fnDisplayEnd() == oSettings.fnRecordsDisplay() )
                {
                oSettings._iDisplayStart = oSettings.fnDisplayEnd() - oSettings._iDisplayLength;
                if ( oSettings._iDisplayStart < 0 )
                {
                oSettings._iDisplayStart = 0;
                }
                }

                if ( oSettings._iDisplayLength == -1 )
                {
                oSettings._iDisplayStart = 0;
                }

                t.fnDraw( oSettings );
            },
        },
        mounted() {
            
        }
    }
</script>