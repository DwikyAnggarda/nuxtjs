<template>
  <div>
    <div class="mini-spacer">
      <v-container>
        <!-- -----------------------------------------------
            Start Ui Form
        ----------------------------------------------- -->
        <v-row justify="center">
          <v-col cols="12" sm="10" md="9" lg="7">
            <div class="text-center">
              <h2 class="ui-title font-weight-bold">
                Reset Password
              </h2>
              <h4>Rayyan Cendekia Utama</h4>
              <p />
            </div>
          </v-col>
        </v-row>

        <!-- -----------------------------------------------
            End Ui Form
        ----------------------------------------------- -->
      </v-container>
    </div>
    <div>
      <v-container>
        <v-row justify="center">
          <v-col cols="12" sm="10" md="9" lg="7">
            
            <v-form ref="form" lazy-validation>
            <v-card>
              <v-card-text>
                <v-text-field v-model="password0" :append-inner-icon="show0 ? 'mdi-eye' : 'mdi-eye-off'"
                    :rules="[rules.required, rules.min]" :type="show0 ? 'text' : 'password'" name="input-10-1"
                    label="Sandi Baru" placeholder="Masukkan sandi baru" counter @click:append-inner="show0 = !show0"
                     />
                  <v-text-field v-model="password1" :append-inner-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    :rules="[rules.required, rules.min]" :type="show1 ? 'text' : 'password'" name="input-10-1"
                    label="Konfirmasi Sandi" placeholder="Konfirmasi sandi" counter @click:append-inner="show1 = !show1"
                     />
                <div class="mt-10">                  
                <v-row>
                  <v-col>
                  <v-btn :disabled="loading" color="success" elevation="0" class="mr-2"  prepend-icon="mdi-reload" @click.prevent="postResetForm">
                    {{loading ? 'Simpan Password...' : 'Simpan Password'}}
                  </v-btn>
                  </v-col>
                    <v-col class="text-right">
                    <v-btn variant="plain" to="/login">
                        Kembali ke Login
                    </v-btn>
                    </v-col>
                </v-row>
                </div>
              </v-card-text>
            </v-card>
            <v-snackbar v-model="snackbar" :color="color" timeout="5000">
            {{ message }}
            </v-snackbar>
            </v-form>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>
<script lang="ts">
export default {
	name: 'UiForm',
	data () {
		return {
			email: '',
            password0: '',
            password1: '',
            loading: false,
            checkbox2: false,
            show0: false,
            show1: false,
            snackbar: false,
            color: 'error',
            message: '',
			rules: {
				required: value => !!value || 'Required.',
				min: v => v.length >= 8 || 'Min 8 characters',
                emailMatch: () => "The email and password you entered don't match",
                emailValid: value => /.+@.+\..+/.test(value) || 'E-mail harus valid'
			}
		}
  },
  setup(props:any){
      return {  };
  },
	mounted: async () => {
        sessionStorage.path = '/reset-password'
		const user = await useUser()
		if (user) {
			navigateTo('/')
		}
	},
	methods: {
		postResetForm: async function () {
            const formRef = this.$refs.form
            let status = await formRef.validate()
            if (!status.valid) return;
            this.loading = true;
            const route = useRoute()
            let resp = await resetPassword(this.password0, this.password1, route.query.code)
            if(resp.success)
            {
              formRef.reset()
              this.message = resp.message;
              this.snackbar = true;
              this.color = resp.success ? 'success' : 'error';
            }
            this.loading = false;
            this.message = resp.message;
            this.snackbar = true;
            this.color = resp.success ? 'success' : 'error';
		}
	}
}

definePageMeta({
	layout: 'blank'
})
</script>
