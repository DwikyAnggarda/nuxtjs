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
    import { useRoute } from 'vue-router'
    import { authFetch } from '../../composables/useAuth'

    definePageMeta({
        middleware: ['auth']
    })

    const route = useRoute()
    let table = ref(null)
    const tableRef = ref(null)
    let snackbar = ref(false)
    let snackbarText = ref('')
    let permissionId = ref(0)
    let isAccess = ref(0)
    let roleName = ref('')

    onMounted(() => {
        authFetch('/role/' + route.params.code).then((res) => {
            return res.json()
        }).then((js) => { 
            roleName.value = js.data
        })

        table = createTable(tableRef, {
            ajax: '/role/' + route.params.code,
            filterBy: [0],
            selectedRowClass: "",
            columns: [
                { data: "permission_name" },
                {
                    data: "action",
                    defaultContent: '<input type="checkbox">',
                    sortable: false,
                    render: function (data, type, row, meta) {
                        return `<label class="switch">
                                    <input type="checkbox" name="access" id="access" value="${row.permission_id}" ${row.is_access == 1 ? 'checked' : ''}/>
                                    <span class="slider round"></span>
                                </label>`
                    }
                },
            ]
        })
    })

    /* Methods */
    const handleClick = async (e:any) => {
        if (e.target.matches('input#access')) {
            permissionId.value = e.target.getAttribute('value')
            isAccess.value = e.target.checked ? 1 : 0
            submitForm()
        }
    }

    const submitForm = async () => {
        if(permissionId.value == 0) {
            snackbarText.value = 'Permision belum dipilih!'
            snackbar.value = true
        }

        const payloadData:any = {
            permission_id: permissionId.value,
            is_access: isAccess.value
        }

        let data = Object.keys(payloadData).map((key) => 
        encodeURIComponent(key) + "=" + encodeURIComponent(payloadData[key])).join("&")

        authFetch('/role/' + route.params.code, {
            method: 'PUT',
            body: data
        })
        .then((res) => {
            if (res.status === 201) {
            } else if (res.status === 400) {
                snackbarText.value = 'Bad Request Error'
                snackbar.value = true
            } else if (res.status === 500) {
                snackbarText.value = 'Server Error'
                snackbar.value = true
            }

            return res.json()
        })
        .then((js) => {
            snackbarText.value = js.message
            snackbar.value = true
            table.ajax.reload()
        })
    }

    /* CRUD Methods */
    const reloadData = () => {
        table.ajax.reload()
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
                    <v-card-title class="text-h4" style="line-height: 3rem;">Detail Role ({{ roleName }})</v-card-title>
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
                            Permission
                        </th>
                        <th class="text-left">
                            Access
                        </th>
                    </tr>
                </thead>
                <tbody @click="handleClick">
                </tbody>
            </datatable>
        </v-card-text>
    </v-card>
</template>