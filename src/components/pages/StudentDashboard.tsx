'use client'

import type { ComponentType, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
	LayoutDashboard,
	Search,
	FileText,
	LogOut,
	MapPin,
	BadgeCheck,
	Bell,
	BedDouble,
	Pencil,
	ChevronRight,
	Image as ImageIcon,
} from 'lucide-react'

const navItems = [
	{
		label: 'Dashboard',
		icon: LayoutDashboard,
		active: true,
		href: '/student-dashboard',
	},
	{
		label: 'Browse Listings',
		icon: Search,
		active: false,
		href: '/students/browseListings',
	},
	{
		label: 'Applications',
		icon: FileText,
		active: false,
		href: '/applications',
	},
]

const stats = [
	{
		label: 'Applications',
		value: '3',
		icon: FileText,
		tint: 'bg-blue-50 text-blue-600',
	},
]

type Accommodation = {
	id: string
	description: string
	area: string
	price: number
	propertyType: string
	photos: string[]
	status: string
	amenities: string[]
}

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

function decodeVapidKey(base64Key: string) {
	const padding = '='.repeat((4 - (base64Key.length % 4)) % 4)
	const base64 = (base64Key + padding).replace(/-/g, '+').replace(/_/g, '/')
	const rawData = window.atob(base64)
	return Uint8Array.from([...rawData].map((character) => character.charCodeAt(0)))
}

function NavButton({
	label,
	icon: Icon,
	active,
	href,
}: {
	label: string
	icon: ComponentType<{ className?: string }>
	active: boolean
	href: string
}) {
	const router = useRouter()

	return (
		<button
			type="button"
			onClick={() => router.push(href)}
			className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
				active
					? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
					: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
			}`}
		>
			<Icon className="h-4 w-4" />
			{label}
		</button>
	)
}

function StatCard({
	label,
	value,
	icon: Icon,
	tint,
}: {
	label: string
	value: string
	icon: ComponentType<{ className?: string }>
	tint: string
}) {
	return (
		<div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
			<div
				className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}
			>
				<Icon className="h-5 w-5" />
			</div>

			<p className="mt-4 text-2xl font-black tracking-[-0.03em] text-slate-950">
				{value}
			</p>

			<p className="mt-1 text-sm text-slate-500">{label}</p>
		</div>
	)
}

function SidebarShell({ children }: { children: ReactNode }) {
	return (
		<aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-200/70 bg-white px-4 py-6 lg:flex">
			{children}
		</aside>
	)
}

export default function StudentDashboard() {
	const router = useRouter()

	const [studentName, setStudentName] = useState('')
	const [studentLoading, setStudentLoading] = useState(true)

	const [matches, setMatches] = useState<Accommodation[]>([])
	const [matchesLoading, setMatchesLoading] = useState(true)
	const [notifications, setNotifications] = useState<StudentNotification[]>([])
	const [notificationsLoading, setNotificationsLoading] = useState(true)
	const [pushState, setPushState] = useState<PushState>('loading')
	const [pushBusy, setPushBusy] = useState(false)
	const [pushError, setPushError] = useState('')

	useEffect(() => {
		let mounted = true

		const fetchStudentProfile = async () => {
			try {
				setStudentLoading(true)

				const response = await fetch('/api/students/profile')
				const data = await response.json()

				if (!response.ok) {
					throw new Error(
						data.error || 'Failed to load student profile.',
					)
				}

				if (!mounted) return

				// The API returns the logged-in student's database record.
				setStudentName(data.user?.name || '')
			} catch (error) {
				console.error('Failed to fetch student profile:', error)

				if (mounted) {
					setStudentName('')
				}
			} finally {
				if (mounted) {
					setStudentLoading(false)
				}
			}
		}

		fetchStudentProfile()

		return () => {
			mounted = false
		}
	}, [])

	const displayName = studentName || 'Student'

	const studentInitial = displayName.charAt(0).toUpperCase()

	const firstName = displayName.trim().split(/\s+/)[0] || 'Student'

	return (
		<div className="flex min-h-screen bg-slate-50">
			<SidebarShell>
				<div>
					<div className="flex items-center gap-3 px-2">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/25">
							⌂
						</div>

						<p className="text-lg font-black tracking-[-0.03em] text-slate-950">
							Stay<span className="text-blue-600">Match</span>
						</p>
					</div>

					<nav className="mt-8 space-y-1">
						{navItems.map((item) => (
							<NavButton
								key={item.label}
								{...item}
							/>
						))}
					</nav>
				</div>

				<div className="space-y-4">
					<div className="rounded-2xl bg-slate-50 p-4">
						<div className="flex items-center gap-3">
							<div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
								{studentLoading ? '...' : studentInitial}
							</div>

							<div className="min-w-0">
								<p className="truncate text-sm font-bold text-slate-900">
									{studentLoading
										? 'Loading...'
										: displayName}
								</p>

								<p className="text-xs text-slate-500">
									Student
								</p>
							</div>
						</div>
					</div>

					<button
						type="button"
						onClick={handleLogout}
						className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
					>
						<LogOut className="h-4 w-4" />
						Log out
					</button>
				</div>
			</SidebarShell>

			<main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">
							Welcome back,{' '}
							{studentLoading ? '...' : firstName}
						</h1>

						<p className="mt-1 text-sm text-slate-500">
							Here's what's new with your housing search.
						</p>
					</div>

					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() =>
								router.push('/students/browseListings')
							}
							className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
						>
							Browse Listings
						</button>
					</div>
				</div>

				<div className="mt-6 grid gap-4 sm:grid-cols-2">
					{stats.map((stat) => (
						<StatCard
							key={stat.label}
							{...stat}
						/>
					))}
				</div>

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
									Notifications are created when landlords add a listing that fits your saved preferences.
								</p>
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-3">
							<button
								type="button"
								onClick={markNotificationsRead}
								className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
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
							) : pushState === 'unsupported' || pushState === 'blocked' ? null : (
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
						{pushError && <p className="mt-3 text-sm font-medium text-red-600">{pushError}</p>}
						{pushState === 'unsupported' && !pushError && (
							<p className="mt-3 text-sm text-amber-700">
								This browser or connection does not support push notifications. Use HTTPS or localhost in a supported browser.
							</p>
						)}
						{pushState === 'blocked' && !pushError && (
							<p className="mt-3 text-sm text-amber-700">
								Notifications are blocked in this browser. Allow notifications for StayMatch in the browser site settings, then reload.
							</p>
						)}

					<div className="mt-5 space-y-3">
						{notificationsLoading ? (
							<p className="rounded-2xl bg-white/80 p-4 text-sm text-slate-500">
								Loading notifications...
							</p>
						) : notifications.length === 0 ? (
							<p className="rounded-2xl bg-white/80 p-4 text-sm text-slate-500">
								No matching accommodation alerts yet. We will notify you when one is added.
							</p>
						) : (
							notifications.slice(0, 5).map((notification) => (
								<button
									key={notification.id}
									type="button"
									onClick={() =>
										router.push(
											`/students/accommodationdetails?id=${notification.accommodation.id}`,
										)
									}
									className={`w-full rounded-2xl border p-4 text-left transition hover:border-blue-300 hover:shadow-md ${
										notification.read
											? 'border-slate-200/70 bg-white/70'
											: 'border-blue-200 bg-white'
									}`}
								>
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="font-bold text-slate-950">{notification.title}</p>
											<p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
										</div>
										{!notification.read && (
											<span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
										)}
									</div>
									<p className="mt-2 text-xs text-slate-400">
										{new Date(notification.createdAt).toLocaleDateString()}
									</p>
								</button>
							))
						)}
					</div>
				</section>

				<div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
					<div className="space-y-6">
						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">
									Recommended for you
								</h2>

								<button
									type="button"
									onClick={() =>
										router.push(
											'/students/browseListings'
										)
									}
									className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
								>
									View all
									<ChevronRight className="h-4 w-4" />
								</button>
							</div>

							<div className="mt-5 space-y-4">
								{matchesLoading ? (
									<div className="py-8 text-center text-sm text-slate-500">
										Loading recommended accommodations...
									</div>
								) : matches.length === 0 ? (
									<div className="py-8 text-center text-sm text-slate-500">
										No recommended accommodations available.
									</div>
								) : (
									matches.map((listing) => (
										<div
											key={listing.id}
											className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 p-4 transition hover:border-blue-200 hover:shadow-md sm:flex-row sm:items-center"
										>
											<div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:w-32">
												{listing.photos?.[0] ? (
													<img
														src={listing.photos[0]}
														alt={
															listing.description ||
															'Accommodation'
														}
														className="h-full w-full object-cover"
													/>
												) : (
													<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500">
														<ImageIcon className="h-8 w-8 text-white/80" />
													</div>
												)}

												{listing.photos?.length >
													1 && (
													<span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-white">
														{
															listing
																.photos
																.length
														}{' '}
														photos
													</span>
												)}
											</div>

											<div className="flex-1">
												<div className="flex flex-wrap items-center gap-2">
													<h3 className="text-base font-bold text-slate-950">
														{listing.propertyType
															.replace(
																/_/g,
																' '
															)
															.toLowerCase()
															.replace(
																/\b\w/g,
																(char) =>
																	char.toUpperCase()
															)}
													</h3>

													{listing.status ===
														'VERIFIED' && (
														<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
															<BadgeCheck className="h-3 w-3" />
															Verified
														</span>
													)}
												</div>

												<p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
													<MapPin className="h-3.5 w-3.5" />
													{listing.area}
												</p>

												<div className="mt-2">
													<span className="text-sm font-bold text-slate-900">
														M{listing.price}{' '}
														/ month
													</span>
												</div>
											</div>

											<button
												type="button"
												onClick={() =>
													router.push(
														`/students/accommodationdetails?id=${listing.id}`
													)
												}
												className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
											>
												View details
											</button>
										</div>
									))
								)}
							</div>
						</section>
					</div>
				</div>
			</main>
		</div>
	)
}