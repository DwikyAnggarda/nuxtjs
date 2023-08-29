<style type="text/css">
	.vcard {
		background-color: #5C9527;
		color: white;
	}
</style>
<script setup lang="ts">
	import {
		ref,
		onMounted,
		onBeforeMount
	} from 'vue'
    import { getToken } from "firebase/messaging"

	const countFinding = ref(0)
	const countFindingApprove = ref(0)
	const countFindingReject = ref(0)
	const countUser = ref(0)
	const usersMarker = []
    const nuxtApp = useNuxtApp()
    const config = useRuntimeConfig()

	definePageMeta({
		middleware: ['auth']
	})

	onBeforeMount(async () => {
        authFetch(`/dashboard/userPosition`).then((res) => {
            return res.json()
        }).then((js) => {
            usersMarker.value = js
        })  
    })

	onMounted(() => {
        getToken(nuxtApp.$messaging, { vapidKey: config.FB_VAPIDKEY }).then((currentToken) => {
		if (currentToken) {
			if(localStorage.NTOKENKEY != currentToken)
			{
				localStorage.NTOKENKEY = currentToken;
				authFetch('/users/webpush', {
					method: 'POST',
					body: 'token='+currentToken,
				})
				.then((res) => {
					if (res.status === 201) {
					} else if (res.status === 400) {
					}
					return res.json()
					})
				.then((js) => {
					console.log('save token')
				})
			}	
		} else {
			// Show permission request UI
			console.log('No registration token available. Request permission to generate one.');
		}
		}).catch((err) => {
			console.log('An error occurred while retrieving token. ', err);
		});

		authFetch(`/dashboard/counter`).then((res) => {
            return res.json()
        }).then((js) => {
        	console.log(js)
        	countFinding.value = js.countFinding
			countFindingApprove.value = js.countFindingApprove
			countFindingReject.value = js.countFindingReject
			countUser.value = js.countUser
        })
	})

</script>
<template>
	<div>
		<v-row>
			<v-col sm="6" md="3" lg="3">
				<v-card class="vcard" style="border-radius:10px; padding:9px">
					<v-card-title style="word-break: break-word" class="font-weight-bold">
						JUMLAH LAPORAN
					</v-card-title>
					<v-card-text>
						<v-row class="mt-1">
							<v-col cols="6" class="d-flex justify-start align-center">
								<span
									style="font-weight: bold; font-size: x-large;">{{ countFinding }}</span>
							</v-col>
							<v-col cols="6" style="padding:6px; padding-top:3px">
								<div class="d-flex justify-end">
									<img src="/images/background/user.png" style="width: 30% !important;">
								</div>
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>
			</v-col>
			<v-col sm="6" md="3" lg="3">
				<v-card class="vcard" style="border-radius:10px; padding:9px">
					<v-card-title style="word-break: break-word" class="font-weight-bold">
						LAPORAN DI SETUJUI
					</v-card-title>
					<v-card-text>
						<v-row class="mt-1">
							<v-col cols="6" class="d-flex justify-start align-center">
								<span
									style="font-weight: bold; font-size: x-large;">{{ countFindingApprove }}</span>
							</v-col>
							<v-col cols="6" style="padding:6px; padding-top:3px">
								<div class="d-flex justify-end">
									<img src="/images/background/sticker.png" style="width: 30% !important;">
								</div>
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>
			</v-col>
			<v-col sm="6" md="3" lg="3">
				<v-card class="vcard" style="border-radius:10px; padding:9px">
					<v-card-title style="word-break: break-word" class="font-weight-bold">
						LAPORAN DI TOLAK
					</v-card-title>
					<v-card-text>
						<v-row class="mt-1">
							<v-col cols="6" class="d-flex justify-start align-center">
								<span
									style="font-weight: bold; font-size: x-large;">{{ countFindingReject }}</span>
							</v-col>
							<v-col cols="6" style="padding:6px; padding-top:3px">
								<div class="d-flex justify-end">
									<img src="/images/background/basket.png" style="width: 30% !important;">
								</div>
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>
			</v-col>
			<v-col sm="6" md="3" lg="3">
				<v-card class="vcard" style="border-radius:10px; padding:9px">
					<v-card-title style="word-break: break-word" class="font-weight-bold">
						JUMLAH USER
					</v-card-title>
					<v-card-text>
						<v-row class="mt-1">
							<v-col cols="6" class="d-flex justify-start align-center">
								<div
									style="font-weight: bold; font-size: x-large;">
									<span>{{ countUser }}</span>
								</div>
							</v-col>
							<v-col cols="6" style="padding:6px; padding-top:3px">
								<div class="d-flex justify-end">
									<img src="/images/background/credit-card.png" style="width: 30% !important;">
								</div>
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
		<v-row>
			<v-col cols="12">
				<v-card>
					<v-card-title class="text-h4">Lokasi User</v-card-title>
					<v-card-text>
						<div style="height:500px; width:100%">
			                <LMap
			                  ref="map"
			                  :zoom="5"
			                  :center="[-2.548926, 118.0148634]"
			                >
			                    <LTileLayer
			                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			                    attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors"
			                    layer-type="base"
			                    name="OpenStreetMap"
			                    />
			                    <template v-for="item in usersMarker.value">
			                        <LMarker :lat-lng="item"> </LMarker>
			                    </template>
			                </LMap>
			            </div>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
	</div>
</template>