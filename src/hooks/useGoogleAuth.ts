'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

declare global {
	interface Window {
		google?: any
	}
}

const GOOGLE_CLIENT_ID =
	process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

type GoogleAuthResponse = {
	access_token?: string
	error?: string
}

type UseGoogleAuthOptions = {
	onSuccess: (accessToken: string) => void
	onError?: (message: string) => void
}

export function useGoogleAuth({
	onSuccess,
	onError,
}: UseGoogleAuthOptions) {
	const googleTokenClientRef = useRef<any>(null)

	const [googleReady, setGoogleReady] =
		useState(false)

	const handleError = useCallback(
		(message: string) => {
			if (onError) {
				onError(message)
			}
		},
		[onError],
	)

	/**
	 * Load Google Identity Services.
	 */
	useEffect(() => {
		if (!GOOGLE_CLIENT_ID) {
			return
		}

		// Google is already loaded.
		if (
			window.google?.accounts?.oauth2
		) {
			setGoogleReady(true)
			return
		}

		const existingScript =
			document.querySelector(
				'script[src="https://accounts.google.com/gsi/client"]',
			)

		if (existingScript) {
			const handleLoad = () => {
				if (
					window.google?.accounts?.oauth2
				) {
					setGoogleReady(true)
				}
			}

			existingScript.addEventListener(
				'load',
				handleLoad,
			)

			return () => {
				existingScript.removeEventListener(
					'load',
					handleLoad,
				)
			}
		}

		const script =
			document.createElement('script')

		script.src =
			'https://accounts.google.com/gsi/client'
		script.async = true
		script.defer = true

		script.onload = () => {
			if (
				window.google?.accounts?.oauth2
			) {
				setGoogleReady(true)
			} else {
				handleError(
					'Google sign-in is unavailable. Please try again.',
				)
			}
		}

		script.onerror = () => {
			handleError(
				'Could not load Google sign-in. Please try again.',
			)
		}

		document.head.appendChild(script)

		return () => {
			// Do not remove the Google script.
			// It can be reused by another page/component.
		}
	}, [handleError])

	/**
	 * Initialise the Google OAuth token client.
	 */
	useEffect(() => {
		if (
			!googleReady ||
			!GOOGLE_CLIENT_ID ||
			!window.google?.accounts?.oauth2
		) {
			return
		}

		googleTokenClientRef.current =
			window.google.accounts.oauth2.initTokenClient(
				{
					client_id: GOOGLE_CLIENT_ID,

					scope: 'openid email profile',

					callback: (
						response: GoogleAuthResponse,
					) => {
						if (
							response.access_token
						) {
							onSuccess(
								response.access_token,
							)

							return
						}

						if (response.error) {
							handleError(
								'Google sign-in was cancelled or failed. Please try again.',
							)
						}
					},

					error_callback: () => {
						handleError(
							'Google sign-in was cancelled or failed. Please try again.',
						)
					},
				},
			)

		return () => {
			googleTokenClientRef.current =
				null
		}
	}, [
		googleReady,
		onSuccess,
		handleError,
	])

	/**
	 * Open Google's account selection/authentication.
	 */
	const requestAccessToken =
		useCallback(() => {
			if (!GOOGLE_CLIENT_ID) {
				handleError(
					'Google sign-in is not configured yet.',
				)
				return
			}

			if (
				!googleTokenClientRef.current
			) {
				handleError(
					'Google sign-in is still loading. Please try again in a moment.',
				)
				return
			}

			googleTokenClientRef.current.requestAccessToken()
		}, [handleError])

	return {
		googleReady,
		requestAccessToken,
	}
}