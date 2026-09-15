'use client'

import { useEffect, useState } from 'react'
import type { ReactNode, ComponentType } from 'react'
import Link from 'next/link'
import {
	LayoutDashboard,
	Search,
	FileText,
	LogOut,
	Bell,
	MapPin,
	BadgeCheck,
	SlidersHorizontal,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react'

const navItems = [
	{ label: 'Dashboard', icon: LayoutDashboard, active: false, href: '/student/dashboard' },
	{ label: 'Browse Listings', icon: Search, active: true, href: '/student/browse' },
	{ label: 'Applications', icon: FileText, active: false, href: '/student/applications' },
]

const propertyTypes = [
	'All Types',
	'Single Room',
	'Shared Apartment',
	'Studio Flat',
	'En-suite',
]

const priceRanges = [
	'Any Price',
	'Under M2,500',
	'M2,500 – M3,500',
	'M3,500 – M4,500',
	'Above M4,500',
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
		case 'SHARED_APARTMENT':
			return 'Shared Apartment'
		case 'STUDIO_FLAT':
			return 'Studio Flat'
		case 'EN_SUITE':
			return 'En-suite'

		// Keep these in case your existing database uses these values.
		case 'DOUBLE':
			return 'Shared Apartment'
		case 'COMMUNE':
			return 'Shared Apartment'
		case 'BACHELOR':
			return 'Studio Flat'

		default:
			return propertyType
	}
}

function getGradient(index: number) {
	const gradients = [
		'from-blue-400 to-indigo-500',
		'from-emerald-400 to-teal-500',
		'from-orange-400 to-rose-500',
		'from-sky-400 to-blue-500',
		'from-violet-400 to-purple-500',
		'from-amber-400 to-orange-500',
	]

	return gradients[index % gradients.length]
}

function isVerified(status: string) {
	return status === 'VERIFIED'
}

function matchesPriceRange(price: number, range: string) {
	switch (range) {
		case 'Under M2,500':
			return price < 2500

		case 'M2,500 – M3,500':
			return price >= 2500 && price <= 3500

		case 'M3,500 – M4,500':
			return price > 3500 && price <= 4500

		case 'Above M4,500':
			return price > 4500

		default:
			return true
	}
}

function StudentBrowseListings() {
	const [query, setQuery] = useState('')
	const [propertyType, setPropertyType] = useState('All Types')
	const [priceRange, setPriceRange] = useState('Any Price')

	const [listings, setListings] = useState<Accommodation[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		const fetchListings = async () => {
			try {
				setLoading(true)
				setError('')

				const response = await fetch('/api/studentbrowselistings')

				const data = await response.json()

				if (!response.ok) {
					throw new Error(
						data.error || 'Failed to load accommodation listings.',
					)
				}

				const accommodations = Array.isArray(data)
					? data
					: data.accommodations || data.listings || []

				const formattedListings: Accommodation[] = accommodations.map(
					(accommodation: any) => ({
						id: accommodation.id,
						title:
							accommodation.title ||
							`${getPropertyTypeLabel(accommodation.propertyType)} in ${accommodation.area}`,
						area: accommodation.area,
						price: Number(accommodation.price),
						propertyType: accommodation.propertyType,
						verified: isVerified(accommodation.status),
						description: accommodation.description || '',
						amenities: Array.isArray(accommodation.amenities)
							? accommodation.amenities
							: [],
						availableFrom: accommodation.availableFrom || null,
						status: accommodation.status,
						latitude: Number(accommodation.latitude),
						longitude: Number(accommodation.longitude),
					}),
				)

				setListings(formattedListings)
			} catch (error) {
				console.error('Failed to fetch accommodation listings:', error)

				setError(
					error instanceof Error
						? error.message
						: 'Something went wrong while loading listings.',
				)
			} finally {
				setLoading(false)
			}
		}

		fetchListings()
	}, [])

	const filteredListings = listings.filter((listing) => {
		const searchText = query.toLowerCase().trim()

		const matchesQuery =
			!searchText ||
			listing.title.toLowerCase().includes(searchText) ||
			listing.area.toLowerCase().includes(searchText) ||
			listing.description.toLowerCase().includes(searchText)

		const matchesType =
			propertyType === 'All Types' ||
			getPropertyTypeLabel(listing.propertyType) === propertyType

		const matchesPrice = matchesPriceRange(listing.price, priceRange)

		return matchesQuery && matchesType && matchesPrice
	})

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
								A
							</div>

							<div>
								<p className="text-sm font-bold text-slate-900">
									Nomhle Cathala
								</p>
								<p className="text-xs text-slate-500">Student</p>
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
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">
							Browse Accommodation
						</h1>

						<p className="mt-1 text-sm text-slate-500">
							Explore verified rooms and apartments near your university.
						</p>
					</div>

					<button
						type="button"
						className="relative grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-300 hover:text-blue-600"
						aria-label="Notifications"
					>
						<Bell className="h-4 w-4" />

						<span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500" />
					</button>
				</div>

				<div className="mt-6 rounded-[1.75rem] border border-slate-200/70 bg-white p-4 shadow-sm sm:p-5">
					<div className="flex flex-col gap-3 lg:flex-row">
						<div className="relative flex-1">
							<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

							<input
								type="text"
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder="Search by area or listing name"
								className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
							/>
						</div>

						<div className="relative lg:w-48">
							<select
								value={propertyType}
								onChange={(event) => setPropertyType(event.target.value)}
								className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
							>
								{propertyTypes.map((type) => (
									<option key={type} value={type}>
										{type}
									</option>
								))}
							</select>

							<ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
						</div>

						<div className="relative lg:w-48">
							<select
								value={priceRange}
								onChange={(event) => setPriceRange(event.target.value)}
								className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
							>
								{priceRanges.map((range) => (
									<option key={range} value={range}>
										{range}
									</option>
								))}
							</select>

							<ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
						</div>

						<button
							type="button"
							className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
						>
							<SlidersHorizontal className="h-4 w-4" />
							More Filters
						</button>
					</div>
				</div>

				{loading && (
					<div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center">
						<p className="text-sm font-semibold text-slate-600">
							Loading accommodation listings...
						</p>
					</div>
				)}

				{error && !loading && (
					<div className="mt-10 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
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

				{!loading && !error && (
					<>
						<p className="mt-5 text-sm text-slate-500">
							<span className="font-bold text-slate-950">
								{filteredListings.length}
							</span>{' '}
							properties found
						</p>

						<div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
							{filteredListings.map((listing, index) => {
								return (
									<article
										key={listing.id}
										className="group overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
									>
										<div
											className={`relative h-44 bg-gradient-to-br ${getGradient(index)}`}
										>
											{listing.verified && (
												<span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-emerald-600 shadow-sm">
													<BadgeCheck className="h-3.5 w-3.5" />
													Verified
												</span>
											)}
										</div>

										<div className="p-5">
											<p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
												{getPropertyTypeLabel(listing.propertyType)}
											</p>

											<h3 className="mt-2 text-base font-bold text-slate-950">
												{listing.title}
											</h3>

											<p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
												<MapPin className="h-3.5 w-3.5" />
												{listing.area}
											</p>

											<p className="mt-3 text-lg font-black tracking-[-0.02em] text-slate-950">
												M{listing.price.toLocaleString()}
												<span className="text-sm font-medium text-slate-400">
													{' '}
													/ month
												</span>
											</p>

											<div className="mt-4 flex gap-2">
												<Link
													href={`/student/accommodationdetails?id=${listing.id}`}
													className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
												>
													View Details
												</Link>

												<button
													type="button"
													className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
												>
													Apply Now
												</button>
											</div>
										</div>
									</article>
								)
							})}
						</div>

						{filteredListings.length === 0 && (
							<div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
								<p className="text-sm font-semibold text-slate-600">
									No listings match your search.
								</p>

								<p className="mt-1 text-sm text-slate-400">
									Try a different area, property type, or price range.
								</p>
							</div>
						)}

						{filteredListings.length > 0 && (
							<div className="mt-8 flex items-center justify-between">
								<p className="text-sm text-slate-500">
									Showing 1–{filteredListings.length} of {listings.length}
								</p>

								<div className="flex items-center gap-2">
									<button
										type="button"
										className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-blue-300 hover:text-blue-600"
										aria-label="Previous page"
									>
										<ChevronLeft className="h-4 w-4" />
									</button>

									<button
										type="button"
										className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600 text-sm font-bold text-white"
									>
										1
									</button>

									<button
										type="button"
										className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-blue-300 hover:text-blue-600"
										aria-label="Next page"
									>
										<ChevronRight className="h-4 w-4" />
									</button>
								</div>
							</div>
						)}
					</>
				)}
			</main>
		</div>
	)
}

export default StudentBrowseListings
