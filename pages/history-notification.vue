<style>
</style>
<script setup lang="ts">
    import {
        ref,
        onMounted
    } from 'vue'
    import { useRouter } from 'vue-router'

    definePageMeta({
        middleware: ['auth']
    })

    const router = useRouter()
    let table = ref(null)
    const tableRef = ref(null)

    onMounted(() => {
        table = createTable(tableRef, {
            ajax: '/history/notification',
            filterBy: [0],
            selectedRowClass: "",
            columns: [
                { data: "title",
                render: function (data, type, row, meta) {
                    return '-'
                } },
                { data: "body",
                render: function (data, type, row, meta) {
                    return '-'
                } },
                { data: "link",
                render: function (data, type, row, meta) {
                    return '-'
                } },
                { data: "message_type",
                render: function (data, type, row, meta) {
                    return '-'
                } },
                { data: "topic",
                render: function (data, type, row, meta) {
                    return '-'
                } },
                { data: "created_at",
                render: function (data, type, row, meta) {
                    return '-'
                } },
                { data: "read_at",
                render: function (data, type, row, meta) {
                    return '-'
                } },
                { data: "status",
                render: function (data, type, row, meta) {
                    return '-'
                } }
            ],
        })
    })

    /* Methods */
    const handleClick = async (e:any) => {
        if (e.target.matches(".detail-tryout-btn")) {
            router.push({
                path: "/role/" + e.target.dataset.id
            })
        }
    }

    /* CRUD Methods */
    const reloadData = () => {
        table.ajax.reload()
    }
</script>
<template>
    <v-card class="mx-auto">
        <v-row>
            <v-col>
                <v-card-item>
                    <v-card-title class="text-h4" style="line-height: 3rem;">History Notification</v-card-title>
                </v-card-item>
            </v-col>
            <v-col>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn size="small" @click="reloadData" color="surface-variant" variant="text" icon="mdi-refresh"></v-btn>
                </v-card-actions>
            </v-col>
        </v-row>
        <v-card-text class="py-0">
            <datatable density="compact" ref="tableRef" :filter="true">
                <thead>
                    <tr>
                        <th class="text-left">
                            Title
                        </th>
                        <th class="text-left">
                            Body
                        </th>
                        <th class="text-left">
                            Link
                        </th>
                        <th class="text-left">
                            Message Type
                        </th>
                        <th class="text-left">
                            Topic
                        </th>
                        <th class="text-left">
                            Created At
                        </th>
                        <th class="text-left">
                            Read At
                        </th>
                        <th class="text-left">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody @click="handleClick">
                </tbody>
            </datatable>
        </v-card-text>
    </v-card>
</template>