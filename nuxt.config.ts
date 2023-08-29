import vuetify from "vite-plugin-vuetify";
export default defineNuxtConfig({
  nitro: {
    preset: 'vercel-edge',
  },
  ssr: false,
	build: {
		transpile: ['vuetify']
	},
	//css: ['@/assets/scss/style.scss'],
	//css: ['vuetify/styles'],
	vite: {
		define: {
			'process.env.DEBUG': false
		}
	},
	runtimeConfig: {
		public: {
			baseURL: process.env.API_URL || 'http://localhost:8000',
			adminPath: process.env.ADMIN_PATH_URL || 'admin',
            FB_API_KEY: process.env.FB_API_KEY,
			FB_AUTH_DOMAIN: process.env.FB_AUTH_DOMAIN,
			FB_PROJECT_ID: process.env.FB_PROJECT_ID,
			FB_STORAGE_BUCKET: process.env.FB_STORAGE_BUCKET,
			FB_MESSAGING_SENDER_ID: process.env.FB_MESSAGING_SENDER_ID,
			FB_APP_ID: process.env.FB_APP_ID,
			FB_MEASUREMENT_ID: process.env.FB_MEASUREMENT_ID,
			FB_VAPIDKEY: process.env.FB_VAPIDKEY || '',
			googleSignIn: {
				clientId: process.env.GOOGLE_CLIENT_ID,
			},
			clientId: process.env.GOOGLE_CLIENT_ID
		}
	},
	modules: [
		'nuxt3-leaflet',
		'nuxt-vue3-google-signin',
		async (options, nuxt) => {
			// @ts-ignore
			nuxt.hooks.hook("vite:extendConfig", (config) => config.plugins.push(vuetify({
				styles: {configFile: "assets/scss/settings.scss"}
			})));
		},
		// https://go.nuxtjs.dev/axios
		// '@nuxtjs/auth-next'
	],
	googleSignIn: {
		clientId: process.env.GOOGLE_CLIENT_ID,
	}
});
