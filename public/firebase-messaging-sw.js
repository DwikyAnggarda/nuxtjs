importScripts(
    "https://www.gstatic.com/firebasejs/9.17.1/firebase-app-compat.js"
);
importScripts(
    "https://www.gstatic.com/firebasejs/9.17.1/firebase-messaging-compat.js"
);

// Initialize the Firebase app in the service worker by passing the generated config
var firebaseConfig = {
    apiKey: "AIzaSyD0diZUDPfomeoRbhQ9WdckwJ_C49cRcPU",
    authDomain: "kerusakan-jalan-5cae7.firebaseapp.com",
    projectId: "kerusakan-jalan-5cae7",
    storageBucket: "kerusakan-jalan-5cae7.appspot.com",
    messagingSenderId: "849121957741",
    appId: "1:849121957741:web:e2cb6de646716d71622c64",
    measurementId: "G-QV5MRY6LCL"
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    console.log('Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body
    };

    // self.registration.showNotification(notificationTitle, notificationOptions);
});