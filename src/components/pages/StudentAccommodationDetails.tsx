'use client'

import { useEffect, useState } from 'react'
import type { ReactNode, ComponentType } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
	LayoutDashboard,
	Search,
	FileText,
	LogOut,
	MapPin,
	BadgeCheck,
	ChevronLeft,
	CalendarDays,
	Home,
	ExternalLink,
	Droplets,
	Zap,
	Wifi,
	Sofa,
	Car,
	ShieldCheck,
	PanelTop,
	LayoutGrid,
	Blinds,
	DoorClosed,
	LockKeyhole,
	Fence,
	Bath,
	Check,
} from 'lucide-react'

const navItems = [
	{
		label: 'Dashboard',
		icon: LayoutDashboard,
		active: false,
		href: '/student/dashboard',
	},
	{
		label: 'Browse Listings',
		icon: Search,
		active: true,
		href: '/student/browseListings',
	},
	{
		label: 'Applications',
		icon: FileText,
		active: false,
		href: '/student/applications',
	},
]

type Accommodation = {
	id: string
	title: string
	area: string
	price: number
	propertyType: string
	verified: boolean
	description: string
	amenities: string[]
	availableFrom: string | null
	status: string
	latitude: number
	longitude: number
}

type IconComponent = ComponentType<{ className?: string }>

function NavButton({
	label,
	icon: Icon,
	active,
	href,
}: {
	label: string
	icon: IconComponent
	active: boolean
	href: string
}) {
	return (
		<Link
			href={href}
			className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
				active
					? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
					: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
			}`}
		>
			<Icon className="h-4 w-4" />
			{label}
		</Link>
	)
}

function SidebarShell({ children }: { children: ReactNode }) {
	return (
		<aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-200/70 bg-white px-4 py-6 lg:flex">
			{children}
		</aside>
	)
}

function getPropertyTypeLabel(propertyType: string) {
	switch (propertyType) {
		case 'SINGLE_ROOM':
			return 'Single Room'
		case 'DOUBLE':
			return 'Double'
		case 'COMMUNE':
			return 'Commune'
		case 'BACHELOR':
			return 'Bachelor'
		default:
			return propertyType
	}
}

function isVerified(status: string) {
	return status === 'VERIFIED'
}

// Picks an icon from the amenity label so new amenities still get a sensible one
function getAmenityIcon(label: string): IconComponent {
	const text = label.toLowerCase()

	if (text.includes('water')) return Droplets
	if (text.includes('electric')) return Zap
	if (
		text.includes('wifi') ||
		text.includes('wi-fi') ||
		text.includes('internet')
	)
		return Wifi
	if (text.includes('furnish')) return Sofa
	if (text.includes('parking')) return Car
	if (text.includes('security')) return ShieldCheck
	if (text.includes('ceiling')) return PanelTop
	if (text.includes('tile')) return LayoutGrid
	if (text.includes('buglar') || text.includes('burglar')) {
		if (text.includes('doors') && text.includes('windows'))
			return LockKeyhole
		if (text.includes('windows')) return Blinds
		if (text.includes('doors')) return DoorClosed
		return LockKeyhole
	}
	if (text.includes('fence')) return Fence
	if (text.includes('toilet')) return Bath

	return Check
}

function formatAvailability(availableFrom: string | null) {
	if (!availableFrom) return 'Not specified'

	const date = new Date(availableFrom)

	if (Number.isNaN(date.getTime())) return 'Not specified'

	if (date.getTime() <= Date.now()) return 'Available now'

	return date.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})
}

function StudentAccommodationDetails() {
	const searchParams = useSearchParams()
	const id = searchParams.get('id')

	const [listing, setListing] = useState<Accommodation | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	const [studentName, setStudentName] = useState('')
	const [studentLoading, setStudentLoading] = useState(true)

	// Fetch the accommodation being viewed
	useEffect(() => {
		if (!id) {
			setLoading(false)
			return
		}

		const fetchListing = async () => {
			try {
				setLoading(true)
				setError('')

				// Uses the existing listings endpoint and picks out this listing.
				// If you add a dedicated endpoint (e.g. /api/studentbrowselistings/[id]),
				// fetch that here instead.
				const response = await fetch('/api/studentbrowselistings')

				const data = await response.json().catch(() => null)

				if (!response.ok || !data) {
					throw new Error(
						data?.error || 'Failed to load accommodation details.',
					)
				}

				const accommodations = Array.isArray(data)
					? data
					: data.accommodations || data.listings || []

				const match = accommodations.find(
					(accommodation: any) => accommodation.id === id,
				)

				if (!match) {
					setListing(null)
					return
				}

				setListing({
					id: match.id,
					title:
						match.title ||
						`${getPropertyTypeLabel(match.propertyType)} in ${match.area}`,
					area: match.area,
					price: Number(match.price),
					propertyType: match.propertyType,
					verified: isVerified(match.status),
					description: match.description || '',
					amenities: Array.isArray(match.amenities)
						? match.amenities
						: [],
					availableFrom: match.availableFrom || null,
					status: match.status,
					latitude: Number(match.latitude),
					longitude: Number(match.longitude),
				})
			} catch (error) {
				console.error('Failed to fetch accommodation details:', error)

				setError(
					error instanceof Error
						? error.message
						: 'Something went wrong while loading this listing.',
				)
			} finally {
				setLoading(false)
			}
		}

		fetchListing()
	}, [id])

	// Fetch logged-in student's profile
	useEffect(() => {
		const fetchStudentProfile = async () => {
			try {
				setStudentLoading(true)

				const response = await fetch('/api/student/profile')

				const data = await response.json()

				if (!response.ok) {
					throw new Error(
						data.error || 'Failed to load student profile.',
					)
				}

				setStudentName(data.user.name)
			} catch (error) {
				console.error('Failed to fetch student profile:', error)
			} finally {
				setStudentLoading(false)
			}
		}

		fetchStudentProfile()
	}, [])

	const studentInitial = studentName
		? studentName.charAt(0).toUpperCase()
		: 'S'

	const hasCoordinates =
		listing !== null &&
		Number.isFinite(listing.latitude) &&
		Number.isFinite(listing.longitude)

	return (
		<div className="flex min-h-screen bg-slate-50">
			<SidebarShell>
				<div>
					<Link href="/" className="flex items-center gap-3 px-2">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/25">
							⌂
						</div>

						<p className="text-lg font-black tracking-[-0.03em] text-slate-950">
							Stay<span className="text-blue-600">Match</span>
						</p>
					</Link>

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
								{studentInitial}
							</div>

							<div>
								<p className="text-sm font-bold text-slate-900">
									{studentLoading
										? 'Loading...'
										: studentName || 'Student'}
								</p>

								<p className="text-xs text-slate-500">
									Student
								</p>
							</div>
						</div>
					</div>

					<Link
						href="/"
						className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
					>
						<LogOut className="h-4 w-4" />
						Log out
					</Link>
				</div>
			</SidebarShell>

			<main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">
				<Link
					href="/student/browseListings"
					className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
				>
					<ChevronLeft className="h-4 w-4" />
					Back to listings
				</Link>

				{loading && (
					<div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center">
						<p className="text-sm font-semibold text-slate-600">
							Loading accommodation details...
						</p>
					</div>
				)}

				{error && !loading && (
					<div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
						<p className="text-sm font-semibold text-rose-700">
							{error}
						</p>

						<button
							type="button"
							onClick={() => window.location.reload()}
							className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
						>
							Try Again
						</button>
					</div>
				)}

				{!loading && !error && !listing && (
					<div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
						<p className="text-sm font-semibold text-slate-600">
							{id
								? 'We couldn’t find this listing.'
								: 'No listing was selected.'}
						</p>

						<p className="mt-1 text-sm text-slate-400">
							It may have been removed, or the link is
							incomplete.
						</p>

						<Link
							href="/student/browseListings"
							className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
						>
							Browse listings
						</Link>
					</div>
				)}

				{!loading && !error && listing && (
					<div className="mt-6 grid gap-6 lg:grid-cols-3">
						<div className="space-y-6 lg:col-span-2">
							<div className="relative h-64 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-blue-400 to-indigo-500 sm:h-80">
								<span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-blue-600 shadow-sm">
									{getPropertyTypeLabel(listing.propertyType)}
								</span>

								{listing.verified && (
									<span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-emerald-600 shadow-sm">
										<BadgeCheck className="h-3.5 w-3.5" />
										Verified
									</span>
								)}
							</div>

							<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
								<h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">
									{listing.title}
								</h1>

								<p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
									<MapPin className="h-4 w-4" />
									{listing.area}
								</p>

								<h2 className="mt-6 text-base font-black tracking-[-0.02em] text-slate-950">
									About this place
								</h2>

								<p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
									{listing.description ||
										'The landlord hasn’t added a description yet.'}
								</p>
							</section>

							<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
								<h2 className="text-base font-black tracking-[-0.02em] text-slate-950">
									Amenities
								</h2>

								{listing.amenities.length > 0 ? (
									<ul className="mt-4 grid gap-3 sm:grid-cols-2">
										{listing.amenities.map((amenity) => {
											const Icon = getAmenityIcon(amenity)

											return (
												<li
													key={amenity}
													className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3"
												>
													<span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
														<Icon className="h-4 w-4" />
													</span>

													<span className="text-sm font-semibold text-slate-700">
														{amenity}
													</span>
												</li>
											)
										})}
									</ul>
								) : (
									<p className="mt-2 text-sm text-slate-500">
										No amenities have been listed for this
										place.
									</p>
								)}
							</section>
						</div>

						<aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
							<div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
								<p className="text-3xl font-black tracking-[-0.03em] text-slate-950">
									M{listing.price.toLocaleString()}
									<span className="text-sm font-medium text-slate-400">
										{' '}
										/ month
									</span>
								</p>

								<dl className="mt-5 space-y-3 text-sm">
									<div className="flex items-center justify-between gap-3">
										<dt className="flex items-center gap-2 text-slate-500">
											<Home className="h-4 w-4" />
											Room type
										</dt>
										<dd className="font-semibold text-slate-800">
											{getPropertyTypeLabel(
												listing.propertyType,
											)}
										</dd>
									</div>

									<div className="flex items-center justify-between gap-3">
										<dt className="flex items-center gap-2 text-slate-500">
											<MapPin className="h-4 w-4" />
											Area
										</dt>
										<dd className="font-semibold text-slate-800">
											{listing.area}
										</dd>
									</div>

									<div className="flex items-center justify-between gap-3">
										<dt className="flex items-center gap-2 text-slate-500">
											<CalendarDays className="h-4 w-4" />
											Availability
										</dt>
										<dd className="font-semibold text-slate-800">
											{formatAvailability(
												listing.availableFrom,
											)}
										</dd>
									</div>

									<div className="flex items-center justify-between gap-3">
										<dt className="flex items-center gap-2 text-slate-500">
											<BadgeCheck className="h-4 w-4" />
											Verification
										</dt>
										<dd
											className={`font-semibold ${
												listing.verified
													? 'text-emerald-600'
													: 'text-slate-800'
											}`}
										>
											{listing.verified
												? 'Verified'
												: 'Not verified yet'}
										</dd>
									</div>
								</dl>

								<button
									type="button"
									className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
								>
									Apply Now
								</button>
							</div>

							{hasCoordinates && (
								<a
									href={`https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600"
								>
									<span className="flex items-center gap-2">
										<MapPin className="h-4 w-4" />
										View on map
									</span>

									<ExternalLink className="h-4 w-4" />
								</a>
							)}
						</aside>
					</div>
				)}
			</main>
		</div>
	)
}

export default StudentAccommodationDetails