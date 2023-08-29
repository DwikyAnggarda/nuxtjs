import { initializeApp } from 'firebase/app'
import { getMessaging } from "firebase/messaging";

import { getAuth } from "firebase/auth"
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from "firebase/analytics"

export default defineNuxtPlugin(nuxtApp => {
    const config = useRuntimeConfig()
    const firebaseConfig = {
        apiKey: config.FB_API_KEY,
        authDomain: config.FB_AUTH_DOMAIN,
        projectId: config.FB_PROJECT_ID,
        storageBucket: config.FB_STORAGE_BUCKET,
        messagingSenderId: config.FB_MESSAGING_SENDER_ID,
        appId: config.FB_APP_ID,
        measurementId: config.FB_MEASUREMENT_ID
    };
    const app = initializeApp(firebaseConfig)
    try{
        const messaging = getMessaging(app);
        nuxtApp.vueApp.provide('messaging', messaging)
        nuxtApp.provide('messaging', messaging)
    }
    catch(e)
    {
        console.log('fb not initialize')
    }
    
})
