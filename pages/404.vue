<template>
    <div class="px-auto py-auto d-flex align-center justify-center" style="width:100%;height: 100vh;">
        <div class="d-flex flex-column align-center" style="gap:35px">
        <img src="/images/404.svg" class="px-4" style="max-width: 100%;">
        <div class="d-flex flex-column align-center" style="gap:19px">
            <h1 class="text-center font-weight-bold" style="font-size: 2.25em; line-height: 41px;">Oops ! Halaman tidak ditemukan </h1>
            <span class="text-center">Halaman yang Anda cari tidak ada atau terjadi kesalahan.<br>Kembali, atau memilih arah baru.</span>
            <NuxtLink :to="url" class="flex-1 no-decoration">
            <v-btn class="v-btn-small white bg-secondary-03" rounded="pill" elevation="0" style="padding: 8px 16px;">Kembali ke halaman utama</v-btn>
            </NuxtLink>
        </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['error'],
    layout: 'error', // you can set a custom layout for the error page
    data: () => ({
        url: ''
    }),
    mounted() {
        this.initData();
    },
    methods: {
        async initData() {
            const user = await useUser()
            if (!user) return;

            if(user.role == 'superuser') {
                this.url = '/';
            } else {
                // await useRouter().push('finding')
                this.url = '/finding';
            }
        }
    }
}
</script>