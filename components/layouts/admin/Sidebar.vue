<script setup lang="ts">
    const user = await useUser()
    const divRef = ref(null)
    const menus = await userMenu()
</script>

<template>
	<div ref="divRef">
		<!-- ---------------------------------------------- -->
		<!---Navigation -->
		<!-- ---------------------------------------------- -->
		<div>
			<div class="d-flex align-center py-3 px-3">
                <div class="mr-3">
                <v-badge
                    bordered
                    bottom
                    color="warning"
                    dot
                    offset-x="0"
                    offset-y="0"
                >
                    <v-avatar size="40">
                        <NuxtLink to="/profile">
                    <img
                        :src="user.avatar_url"
                        alt="Title"
                        width="40"
                    />
                        </NuxtLink>
                    </v-avatar>
                </v-badge>
                </div>
                <div class="mx-3">
                    <h4 class="font-weight-medium">{{user.name}}</h4>
                    <h6 class="truncate-text">{{user.email}}</h6>
                </div>
            </div>
			<v-card class="mx-auto" max-width="300" style="background:transparent !important;">
				<v-list density="compact">
                    <template v-for="item in menus" :key="item.title">
                        <v-list-item
                            :to="item.url"
                            :prepend-icon ="item.icon"
                            :title ="item.title"
                        ></v-list-item>
                    </template>
				</v-list>
			</v-card>
		</div>
	</div>
</template>