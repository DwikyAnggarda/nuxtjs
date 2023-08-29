<style>
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
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
            ajax: '/roles',
            filterBy: [0],
            selectedRowClass: "",
            columns: [
                { data: "name" },
                {
                    data: "action",
                    sortable: false,
                    render: function (data, type, row, meta) {
                        return `<div class="pa-2">
                        <button type="button" style="background-color:#E2F1FD;color:#2196F3" class="text-capitalize v-btn v-btn--elevated v-theme--light v-btn--density-default elevation-0 rounded-pill v-btn--size-default v-btn--variant-elevated detail-tryout-btn" data-id="${row.id}">
                        Detail
                        </button>
                        </div>`
                    }
                },
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
                    <v-card-title class="text-h4" style="line-height: 3rem;">Role Management</v-card-title>
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
                            Role Name
                        </th>
                        <th class="text-left">
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody @click="handleClick">
                </tbody>
            </datatable>
        </v-card-text>
    </v-card>
</template>