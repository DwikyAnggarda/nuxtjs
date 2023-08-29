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
                Login Administrator
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
        <div class="d-flex justify-center">
            <div>
            <v-form ref="formLogin" @submit="postLoginForm" lazy-validation>
            <v-card>
              <v-card-text>
                <v-text-field v-model="email" :rules="[rules.required, rules.emailValid]" v-on:keyup.enter="prosesSubmit" label="Email" type="email" placeholder="Email address" />
                <v-text-field
                  v-model="password"
                  :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                  :rules="[rules.required, rules.min]"
                  v-on:keyup.enter="prosesSubmit"
                  :type="show1 ? 'text' : 'password'"
                  name="input-10-1"
                  label="Password"
                  placeholder="Enter password"
                  counter
                  @click:append="show1 = !show1"
                />
                <v-text-field v-model="iUserAgent" v-if="false" label="user agent" disabled type="text" />
                <v-text-field v-model="iLatitude" v-if="false" label="user agent" disabled type="text" />
                <v-text-field v-model="iLongitude" v-if="false" label="user agent" disabled type="text" />
                <div class="mt-10">                  
                <v-row>
                  <v-col>
                  <v-btn :disabled="loading" color="success" elevation="0" class="mr-2"  prepend-icon="mdi-login" @click.prevent="postLoginForm">
                    {{loading ? 'Login...' : 'Login'}}
                  </v-btn>
                  </v-col>
                    <v-col class="text-right">
                    <v-btn variant="plain" to="/lupa-password">
                        Lupa password
                    </v-btn>
                    </v-col>
                </v-row>
                </div>
              </v-card-text>
            </v-card>
            </v-form>
            </div>
            <v-snackbar v-model="snackbar" color="error" timeout="5000">
            {{ message }}
            </v-snackbar>
        </div>
      </v-container>
    </div>
  </div>
</template>
<script lang="ts">
export default {
	name: 'UiForm',
	data () {
		return {
      iUserAgent: 'dummy',
      iLatitude: '000',
      iLongitude: '000',
			email: '',
      password: '',
      loading: false,
      checkbox2: false,
      show1: false,
      snackbar: false,
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
        sessionStorage.path = '/login'
		const user = await useUser()
		if (user) {
			navigateTo('/')
		}
	},
	methods: {
    prosesSubmit(){
        this.postLoginForm()
    },
    postLoginForm: async function () {
        this.submitLogin()
    //   navigator.geolocation.getCurrentPosition(this.showPosition)
    //   var navUserAgent = navigator.userAgent
    //   this.iUserAgent = navUserAgent;
		},
    submitLogin: async function (){
    //   console.log(position)
    //   this.iLatitude = position.coords.latitude
    //   this.iLongitude = position.coords.longitude

      const formLoginRef = this.$refs.formLogin
      let status = await formLoginRef.validate()
      if (!status.valid) return;
      this.loading = true;
      let resp = await loginWithEmail(this.email, this.password, this.iUserAgent, this.iLatitude, this.iLongitude);
      this.loading = false;
      console.log('resp', resp)
      if(!resp.success)
      {
        this.message = resp.message;
        this.snackbar = true;
      }
    },
	}
}

definePageMeta({
	layout: 'blank'
})
</script>
