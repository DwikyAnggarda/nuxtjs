export default defineNuxtRouteMiddleware(async (to) => {
	const user = await useUser()
	if (user === null || user === undefined) {
		console.log('redirect to login page')
		return navigateTo('/login')
	} else if (to.path === '/login') {		
		return navigateTo('/')
	} else if(user.restrict === true){
		return navigateTo('404')		
	}
})
