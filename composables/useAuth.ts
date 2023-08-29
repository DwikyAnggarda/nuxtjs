import { useRouter, useState } from '#app'
import useErrorMapper from './useErrorMapper'
import { ISession } from '~~/types/ISession'
import { IUser } from '~/types/IUser'

export const useAuthCookie = () => useCookie('XSRF-TOKEN') // auth_token

export async function useUser (): Promise<IUser | null> {
	const authCookie = useAuthCookie().value
	const user = useState<IUser|null>('user')

	if (authCookie && !user.value) {
		const response = await authFetch('/me?p='+window.location.pathname)
		const result = await response.json()

		if (result.success) {
			user.value = result.user
		}
	}
	return user.value
}

export async function useLoggedIn () {
	const user = await useUser()

	if (!user) {
		return false
	}

	if (user?.id == null) {
		return false
	}

	return true
}

export async function userMenu () {
    const menus:any = []
    const response = await authFetch('/menus')
    const result = await response.json()

    if (result.success) {
        menus.value = result.data
    }

    return menus.value
}

export async function authFetch (url: string, options?: any) {
	const config = await useRuntimeConfig()
	const cookieXSRF = await useCookie('XSRF-TOKEN')
	if (!options) { options = {} }
	if (!options.headers) { options.headers = {} }
	const headers = Object.assign({
		'Content-Type': 'application/x-www-form-urlencoded',
		'Accept': 'application/json',
		'X-XSRF-TOKEN': cookieXSRF.value
	}, options.headers)
	const params = Object.assign({
		method: 'GET',
		credentials: 'include'
	}, options)
	if (headers['Content-Type'] == null) { delete headers['Content-Type'] }
	params.headers = headers
	return fetch(config.public.baseURL + '/' + config.public.adminPath + url, params)
}

export async function userLogout () {
	await authFetch('/logout')
	useState('user').value = null
	await useRouter().push('/login')
}

export async function registerWithEmail (
	username: string,
	name: string,
	email: string,
	password: string
): Promise<FormValidation> {
	try {
		const data = await $fetch<ISession>('/api/auth/register', {
			method: 'POST',
			body: { username, name, email, password }
		})

		if (data) {
			useState('user').value = data
			await useRouter().push('/topics')
		}

		return { hasErrors: false, loggedIn: true }
	} catch (error: any) {
		return useErrorMapper(error.data.data)
	}
}

export async function loginWithEmail (usernameOrEmail: string, password: string, userAgent: string, latitude: string, longitude: string): Promise<FormValidation> {
	try {
		// sanctum/csrf-cookie
		const config = await useRuntimeConfig()
		await fetch(config.public.baseURL + '/sanctum/csrf-cookie', {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Cache: 'no-cache'
			},
			credentials: 'include'
		})

		const cookieXSRF = await useCookie('XSRF-TOKEN')
		const payload = { email: usernameOrEmail, password, userAgent, latitude, longitude }
		const response = await fetch(config.public.baseURL + '/login-admin', {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'X-XSRF-TOKEN': cookieXSRF.value
			},
			method: 'POST',
			// withCredentials:true,
			body: JSON.stringify(payload),
			// mode: 'cors', // no-cors, *cors, same-origin
			// cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
			credentials: 'include'
		})

		const result = await response.json()

		if (!result) {
			throw new Error('something went wrong')
		}
		if (!result.success) {
			return result;
		}
		useState('user').value = result.user
		if(result.user.role == 'superuser') {
			await useRouter().push('/')
		} else {
			await useRouter().push('finding')
		}

		return { hasErrors: false, loggedIn: true }
	} catch (error: any) {
		return useErrorMapper(error.data.data)
	}
}

export async function loginWithGoogle (access_token: string): Promise<FormValidation> {
	try {
		// sanctum/csrf-cookie
		const config = await useRuntimeConfig()
		await fetch(config.public.baseURL + '/sanctum/csrf-cookie', {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Cache: 'no-cache'
			},
			credentials: 'include'
		})

		const cookieXSRF = await useCookie('XSRF-TOKEN')
		const payload = { token: access_token }
		const response = await fetch(config.public.baseURL + '/login-google', {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'X-XSRF-TOKEN': cookieXSRF.value
			},
			method: 'POST',
			// withCredentials:true,
			body: JSON.stringify(payload),
			// mode: 'cors', // no-cors, *cors, same-origin
			// cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
			credentials: 'include'
		})

		const result = await response.json()

		if (!result) {
			throw new Error('something went wrong')
		}
		if (!result.success) {
			return { hasErrors: false, loggedIn: false }
		}
		console.log(result);
		useState('user').value = result.user
		// const user = useState<IUser | null>('user')
		await useRouter().push('/')

		return { hasErrors: false, loggedIn: true }
	} catch (error: any) {
		return useErrorMapper(error.data.data)
	}
}

export async function forgotPassword (usernameOrEmail: string,role: string): Promise<FormValidation> {
	try {
		// sanctum/csrf-cookie
		const config = await useRuntimeConfig()
		await fetch(config.public.baseURL + '/sanctum/csrf-cookie', {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Cache: 'no-cache'
			},
			credentials: 'include'
		})

		const cookieXSRF = await useCookie('XSRF-TOKEN')
		const payload = { email: usernameOrEmail,role: role }
		const response = await fetch(config.public.baseURL + '/forgot-password', {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'X-XSRF-TOKEN': cookieXSRF.value
			},
			method: 'POST',
			// withCredentials:true,
			body: JSON.stringify(payload),
			// mode: 'cors', // no-cors, *cors, same-origin
			// cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
			credentials: 'include'
		})

		const result = await response.json()

		if (!result) {
			throw new Error('something went wrong')
		}
		return result;
	} catch (error: any) {
		return useErrorMapper(error.data.data)
	}
}

export async function resetPassword (password: string, passwordConfirmation: string, hashkey: string): Promise<FormValidation> {
	try {
		// sanctum/csrf-cookie
		const config = await useRuntimeConfig()
		await fetch(config.public.baseURL + '/sanctum/csrf-cookie', {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Cache: 'no-cache'
			},
			credentials: 'include'
		})

		const cookieXSRF = await useCookie('XSRF-TOKEN')
		const payload = { password: password, password_confirmation: passwordConfirmation, hash_key: hashkey }
		const response = await fetch(config.public.baseURL + '/reset-password', {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'X-XSRF-TOKEN': cookieXSRF.value
			},
			method: 'POST',
			// withCredentials:true,
			body: JSON.stringify(payload),
			// mode: 'cors', // no-cors, *cors, same-origin
			// cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
			credentials: 'include'
		})

		const result = await response.json()

		if (!result) {
			throw new Error('something went wrong')
		}
		return result;
	} catch (error: any) {
		return useErrorMapper(error.data.data)
	}
}