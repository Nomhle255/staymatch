'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'

type StudentNotification = {
	id: string
	title: string
	message: string
	read: boolean
	createdAt: string
	accommodation: {
		id: string
		area: string
		propertyType: string
		price: number
	}
}

type PushState = 'loading' | 'unsupported' | 'disabled' | 'enabled' | 'blocked'

const MAX_VISIBLE = 5

function decodeVapidKey(base64Key: string) {
	const padding = '='.repeat((4 - (base64Key.length % 4)) % 4)
	const base64 = (base64Key + padding).replace(/-/g, '+').replace(/_/g, '/')
	const rawData = window.atob(base64)
	return Uint8Array.from([...rawData].map((character) => character.charCodeAt(0)))
}

function isPushSupported() {
	return (
		typeof window !== 'undefined' &&
		'serviceWorker' in navigator &&
		'PushManager' in window &&
		'Notification' in window
	)
}

export default function NotificationsPanel() {
	const router = useRouter()

	const [notifications, setNotifications] = useState<StudentNotification[]>([])
	const [loading, setLoading] = useState(true)

	const [pushState, setPushState] = useState<PushState>('loading')
	const [pushBusy, setPushBusy] = useState(false)
	const [pushError, setPushError] = useState('')

	// Only unread notifications are shown
	const unreadNotifications = notifications.filter((n) => !n.read)

	// Load notifications
	useEffect(() => {
		let mounted = true

		const fetchNotifications = async () => {
			try {
				setLoading(true)

				const response = await fetch('/api/students/notifications')
				const data = await response.json().catch(() => null)

				if (!response.ok || !data) {
					throw new Error(data?.error || 'Failed to load notifications.')
				}

				const list = Array.isArray(data) ? data : data.notifications || []

				if (mounted) setNotifications(list)
			} catch (error) {
				console.warn('Failed to fetch notifications:', error)

				if (mounted) setNotifications([])
			} finally {
				if (mounted) setLoading(false)
			}
		}

		fetchNotifications()

		return () => {
			mounted = false
		}
	}, [])

	// Work out whether this device already has push alerts turned on
	useEffect(() => {
		let mounted = true

		const checkPushState = async () => {
			if (!isPushSupported()) {
				if (mounted) setPushState('unsupported')
				return
			}

			if (Notification.permission === 'denied') {
				if (mounted) setPushState('blocked')
				return
			}

			try {
				const registration = await navigator.serviceWorker.getRegistration()
				const subscription = await registration?.pushManager.getSubscription()

				if (mounted) {
					setPushState(
						subscription && Notification.permission === 'granted'
							? 'enabled'
							: 'disabled',
					)
				}
			} catch {
				if (mounted) setPushState('disabled')
			}
		}

		checkPushState()

		return () => {
			mounted = false
		}
	}, [])

	// Clicking a notification: remove it, mark it read, open the room
	const openNotification = (notification: StudentNotification) => {
		setNotifications((current) =>
			current.filter((item) => item.id !== notification.id),
		)

		// Fire and forget so navigation is never blocked
		fetch('/api/students/notifications', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: notification.id }),
		}).catch((error) => {
			console.warn('Failed to mark notification as read:', error)
		})

		router.push(
			`/students/accommodationdetails?id=${notification.accommodation.id}`,
		)
	}

	const markAllRead = async () => {
		if (unreadNotifications.length === 0) return

		// Update the screen right away, then tell the server
		const previous = notifications
		setNotifications((current) =>
			current.map((notification) => ({ ...notification, read: true })),
		)

		try {
			const response = await fetch('/api/students/notifications', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ all: true }),
			})

			if (!response.ok) throw new Error('Request failed')
		} catch (error) {
			console.warn('Failed to mark notifications as read:', error)
			setNotifications(previous)
		}
	}

	const enableBrowserNotifications = async () => {
		setPushError('')

		if (!isPushSupported()) {
			setPushState('unsupported')
			return
		}

		const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

		if (!publicKey) {
			setPushError('Device alerts are not configured yet.')
			return
		}

		try {
			setPushBusy(true)

			const permission = await Notification.requestPermission()

			if (permission !== 'granted') {
				setPushState(permission === 'denied' ? 'blocked' : 'disabled')
				return
			}

			const registration = await navigator.serviceWorker.register('/sw.js')
			await navigator.serviceWorker.ready

			const subscription =
				(await registration.pushManager.getSubscription()) ??
				(await registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: decodeVapidKey(publicKey) as BufferSource,
				}))

			const response = await fetch('/api/students/push-subscription', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(subscription.toJSON()),
			})

			if (!response.ok) {
				throw new Error('Could not save this device for alerts.')
			}

			setPushState('enabled')
		} catch (error) {
			console.warn('Failed to enable device alerts:', error)

			setPushError(
				error instanceof Error
					? error.message
					: 'Could not enable device alerts.',
			)
		} finally {
			setPushBusy(false)
		}
	}

	const disableBrowserNotifications = async () => {
		setPushError('')

		try {
			setPushBusy(true)

			const registration = await navigator.serviceWorker.getRegistration()
			const subscription = await registration?.pushManager.getSubscription()

			if (subscription) {
				const endpoint = subscription.endpoint

				await subscription.unsubscribe()

				await fetch('/api/students/push-subscription', {
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ endpoint }),
				}).catch(() => null)
			}

			setPushState('disabled')
		} catch (error) {
			console.warn('Failed to disable device alerts:', error)

			setPushError(
				error instanceof Error
					? error.message
					: 'Could not disable device alerts.',
			)
		} finally {
			setPushBusy(false)
		}
	}

	return (
		<section className="mt-6 rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
						<Bell className="h-5 w-5" />
					</div>
					<div>
						<h2 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">
							New accommodation matches
						</h2>
						<p className="text-sm text-slate-500">
							Notifications are created when landlords add a listing
							that fits your saved preferences.
						</p>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<button
						type="button"
						onClick={markAllRead}
						disabled={unreadNotifications.length === 0}
						className="text-sm font-semibold text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-300"
					>
						Mark all as read
					</button>

					{pushState === 'enabled' ? (
						<button
							type="button"
							onClick={disableBrowserNotifications}
							disabled={pushBusy}
							className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 disabled:opacity-50"
						>
							{pushBusy ? 'Updating...' : 'Disable device alerts'}
						</button>
					) : pushState === 'unsupported' ||
					  pushState === 'blocked' ? null : (
						<button
							type="button"
							onClick={enableBrowserNotifications}
							disabled={pushBusy || pushState === 'loading'}
							className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
						>
							{pushBusy ? 'Enabling...' : 'Enable device alerts'}
						</button>
					)}
				</div>
			</div>

			{pushError && (
				<p className="mt-3 text-sm font-medium text-red-600">{pushError}</p>
			)}
			{pushState === 'unsupported' && !pushError && (
				<p className="mt-3 text-sm text-amber-700">
					This browser or connection does not support push notifications.
					Use HTTPS or localhost in a supported browser.
				</p>
			)}
			{pushState === 'blocked' && !pushError && (
				<p className="mt-3 text-sm text-amber-700">
					Notifications are blocked in this browser. Allow notifications
					for StayMatch in the browser site settings, then reload.
				</p>
			)}

			<div className="mt-5 space-y-3">
				{loading ? (
					<p className="rounded-2xl bg-white/80 p-4 text-sm text-slate-500">
						Loading notifications...
					</p>
				) : unreadNotifications.length === 0 ? (
					<p className="rounded-2xl bg-white/80 p-4 text-sm text-slate-500">
						We will notify you when a new
						accommodation matches your preferences.
					</p>
				) : (
					unreadNotifications.slice(0, MAX_VISIBLE).map((notification) => (
						<button
							key={notification.id}
							type="button"
							onClick={() => openNotification(notification)}
							className="w-full rounded-2xl border border-blue-200 bg-white p-4 text-left transition hover:border-blue-300 hover:shadow-md"
						>
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="font-bold text-slate-950">
										{notification.title}
									</p>
									<p className="mt-1 text-sm leading-6 text-slate-600">
										{notification.message}
									</p>
								</div>
								<span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
							</div>
							<p className="mt-2 text-xs text-slate-400">
								{new Date(notification.createdAt).toLocaleDateString()}
							</p>
						</button>
					))
				)}
			</div>
		</section>
	)
}