'use client'

import type { ComponentType, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
	LayoutDashboard,
	Search,
	LogOut,
	MapPin,
	BadgeCheck,
	User,
	ChevronRight,
	Image as ImageIcon,
} from 'lucide-react'
import NotificationsPanel from './NotificationsPanel'

const navItems = [
	{
		label: 'Dashboard',
		icon: LayoutDashboard,
		active: true,
		href: '/students/dashboard',
	},
	{
		label: 'Browse Listings',
		icon: Search,
		active: false,
		href: '/students/browseListings',
	},
	{
		label: 'Profile',
		icon: User,
		active: false,
		href: '/profile',
	},
]

const MAX_RECOMMENDED = 3

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

	// Logged-in student's profile
	useEffect(() => {
		let mounted = true

		const fetchStudentProfile = async () => {
			try {
				setStudentLoading(true)

				const response = await fetch('/api/students/profile')

				// An HTML error page resolves to null instead of a JSON syntax error
				const data = await response.json().catch(() => null)

				if (!response.ok || !data) {
					throw new Error(
						data?.error ||
							`Failed to load student profile (${response.status}).`,
					)
				}

				if (!mounted) return

				setStudentName(data.user?.name || '')
			} catch (error) {
				// The name only shows in the sidebar, so don't raise an error overlay
				console.warn('Failed to fetch student profile:', error)

				if (mounted) setStudentName('')
			} finally {
				if (mounted) setStudentLoading(false)
			}
		}

		fetchStudentProfile()

		return () => {
			mounted = false
		}
	}, [])

	// "Recommended for you": verified listings first
	useEffect(() => {
		let mounted = true

		const fetchMatches = async () => {
			try {
				setMatchesLoading(true)

				const response = await fetch('/api/studentbrowselistings')
				const data = await response.json().catch(() => null)

				if (!response.ok || !data) {
					throw new Error(data?.error || 'Failed to load listings.')
				}

				const raw = Array.isArray(data)
					? data
					: data.accommodations || data.listings || []

				const formatted: Accommodation[] = raw.map((item: any) => ({
					id: item.id,
					description: item.description || '',
					area: item.area,
					price: Number(item.price),
					propertyType: item.propertyType || '',
					photos: Array.isArray(item.photos) ? item.photos : [],
					status: item.status,
					amenities: Array.isArray(item.amenities) ? item.amenities : [],
				}))

				formatted.sort(
					(a, b) =>
						Number(b.status === 'VERIFIED') -
						Number(a.status === 'VERIFIED'),
				)

				if (mounted) setMatches(formatted.slice(0, MAX_RECOMMENDED))
			} catch (error) {
				console.warn('Failed to fetch recommended listings:', error)

				if (mounted) setMatches([])
			} finally {
				if (mounted) setMatchesLoading(false)
			}
		}

		fetchMatches()

		return () => {
			mounted = false
		}
	}, [])

	const handleLogout = async () => {
		try {
			await fetch('/api/auth/logout', { method: 'POST' })
		} catch (error) {
			console.warn('Logout request failed:', error)
		}

		router.push('/')
	}

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
							<NavButton key={item.label} {...item} />
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
									{studentLoading ? 'Loading...' : displayName}
								</p>

								<p className="text-xs text-slate-500">Student</p>
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
							Welcome back, {studentLoading ? '...' : firstName}
						</h1>

						<p className="mt-1 text-sm text-slate-500">
							Here&apos;s what&apos;s new with your housing search.
						</p>
					</div>

					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() => router.push('/students/browseListings')}
							className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
						>
							Browse Listings
						</button>
					</div>
				</div>

				<NotificationsPanel />

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
										router.push('/students/browseListings')
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
													// eslint-disable-next-line @next/next/no-img-element
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

												{listing.photos?.length > 1 && (
													<span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-white">
														{listing.photos.length} photos
													</span>
												)}
											</div>

											<div className="flex-1">
												<div className="flex flex-wrap items-center gap-2">
													<h3 className="text-base font-bold text-slate-950">
														{listing.propertyType
															.replace(/_/g, ' ')
															.toLowerCase()
															.replace(/\b\w/g, (char) =>
																char.toUpperCase(),
															)}
													</h3>

													{listing.status === 'VERIFIED' && (
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
														M{listing.price.toLocaleString()} /
														month
													</span>
												</div>
											</div>

											<button
												type="button"
												onClick={() =>
													router.push(
														`/students/accommodationdetails?id=${listing.id}`,
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