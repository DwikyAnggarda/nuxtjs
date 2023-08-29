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
                Lupa Password
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
            
            <v-form ref="form" v-model="valid" @submit.prevent="postResetForm" lazy-validation>
            <v-card>
              <v-card-text>
                <v-text-field v-model="email" :rules="[rules.required, rules.emailValid]" label="Email" type="email" placeholder="Email address" />
               
                <div class="mt-10">                  
                <v-row>
                  <v-col>
                  <v-btn :disabled="loading" color="success" elevation="0" class="mr-2"  prepend-icon="mdi-reload" @click.prevent="postResetForm">
                    {{loading ? 'Reset Password...' : 'Reset Password'}}
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
            password: '',
            valid: true,
            loading: false,
            checkbox2: false,
            show1: false,
            snackbar: false,
            color: 'error',
            message: '',
            role: 'internal',
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
        sessionStorage.path = '/lupa-password'
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
            let resp = await forgotPassword(this.email,this.role);
            this.loading = false;
            this.message = resp.message;
            this.snackbar = true;
            this.color = resp.success ? 'success' : 'error';
            if(resp.success)this.email='';
		}
	}
}

definePageMeta({
	layout: 'blank'
})
</script>
