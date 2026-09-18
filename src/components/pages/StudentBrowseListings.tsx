'use client'

import { useEffect, useState } from 'react'
import type { ReactNode, ComponentType } from 'react'
import Link from 'next/link'
import {
	LayoutDashboard,
	Search,
	FileText,
	LogOut,
	MapPin,
	BadgeCheck,
	SlidersHorizontal,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
<<<<<<< Updated upstream
=======
	University,
	Sparkles,
>>>>>>> Stashed changes
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
		href: '/student/browse',
	},
	{
		label: 'Applications',
		icon: FileText,
		active: false,
		href: '/student/applications',
	},
]

const propertyTypes = [
	'All Types',
	'Single Room',
	'Double',
	'Commune',
	'Bachelor',
]

const priceRanges = [
	'Any Price',
	'Under M500',
	'M500 – M800',
	'M800 – M1,000',
	'Above M1,000',
]

<<<<<<< Updated upstream
=======
// value is the max distance in km (0 = no limit)
const distanceOptions = [
	{ label: 'Any Distance', value: 0 },
	{ label: 'Within 5 km', value: 1 },
	{ label: 'Within 10 km', value: 2 },
	{ label: 'Within 15 km', value: 5 },
	{ label: 'Within 20 km', value: 10 },
]

const minMatchOptions = [
	{ label: 'Any match', value: 0 },
	{ label: '50%+ match', value: 50 },
	{ label: '70%+ match', value: 70 },
	{ label: '90%+ match', value: 90 },
]

// Distance beyond this scores 0 for the "close to university" factor
const MAX_SCORED_DISTANCE_KM = 10

type PreferenceFactor = {
	key: string
	label: string
	keywords?: string[]
}

const preferenceFactors: PreferenceFactor[] = [
	{ key: 'price', label: 'Affordable rental price' },
	{ key: 'distance', label: 'Close to university' },
	{ key: 'verified', label: 'Verified listing' },
	{ key: 'wifi', label: 'WiFi', keywords: ['wifi', 'wi-fi', 'internet'] },
	{ key: 'water', label: 'Water Availability', keywords: ['water'] },
	{key: 'electricity',label: 'Electricity Availability', keywords: ['electric', 'power'] },
	{key: 'security',label: 'Security',keywords: ['security', 'guard', 'gate', 'fence', 'cctv'],},
	{ key: 'ceiling', label: 'Ceiling', keywords: ['Ceiling'] },
	{ key: 'tile', label: 'Tile', keywords: ['Tile'] },
	{ key: 'buglars', label: 'Buglars', keywords: ['Buglars'] },
	{ key: 'toilet', label: 'Clean Toilet', keywords: ['toilet'] },
]

>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
type ListingWithDistance = Accommodation & {
	// Distance to the selected university, in km.
	distanceKm: number | null
	// null when the student hasn't rated anything.
	matchScore: number | null
}

type UniversityOption = {
	id: string
	name: string
	latitude: number
	longitude: number
}

>>>>>>> Stashed changes
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
		case 'Under M500':
			return price < 500

		case 'M500 – M800':
			return price >= 500 && price <= 800

		case 'M800 – M1,000':
			return price > 800 && price <= 1000

		case 'Above M1,000':
			return price > 1000

		default:
			return true
	}
}

<<<<<<< Updated upstream
=======
function toRadians(degrees: number) {
	return (degrees * Math.PI) / 180
}

// Haversine formula: great-circle (straight-line) distance between two
// coordinates, in kilometres. Returns null if any coordinate is invalid.
function calculateDistanceKm(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number | null {
	if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) {
		return null
	}

	const EARTH_RADIUS_KM = 6371

	const dLat = toRadians(lat2 - lat1)
	const dLon = toRadians(lon2 - lon1)

	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRadians(lat1)) *
			Math.cos(toRadians(lat2)) *
			Math.sin(dLon / 2) ** 2

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

	return EARTH_RADIUS_KM * c
}

function formatDistance(km: number) {
	if (km < 1) {
		// Round to the nearest 10 m so it doesn't look falsely precise
		return `${Math.round((km * 1000) / 10) * 10} m`
	}

	return `${km.toFixed(1)} km`
}

type PriceBounds = { min: number; max: number }

type ActiveFactor = { factor: PreferenceFactor; weight: number }

function hasAmenity(amenities: string[], keywords: string[]) {
	return amenities.some((amenity) => {
		const text = amenity.toLowerCase()
		return keywords.some((keyword) => text.includes(keyword))
	})
}

// How well one listing satisfies one factor: 0 (not at all) to 1 (fully)
function getFactorSatisfaction(
	listing: Accommodation & { distanceKm: number | null },
	factor: PreferenceFactor,
	priceBounds: PriceBounds,
) {
	switch (factor.key) {
		case 'price': {
			const range = priceBounds.max - priceBounds.min
			if (!Number.isFinite(listing.price)) return 0
			if (range <= 0) return 1
			return 1 - (listing.price - priceBounds.min) / range
		}

		case 'distance':
			if (listing.distanceKm === null) return 0
			return (
				1 -
				Math.min(listing.distanceKm, MAX_SCORED_DISTANCE_KM) /
					MAX_SCORED_DISTANCE_KM
			)

		case 'verified':
			return listing.verified ? 1 : 0

		default:
			return hasAmenity(listing.amenities, factor.keywords ?? [])
				? 1
				: 0
	}
}

// Weighted average of how well the listing meets each rated factor, so a
// factor rated 5 counts five times as much as one rated 1. Returns 0–100,
// or null when nothing has been rated.
function calculateMatchScore(
	listing: Accommodation & { distanceKm: number | null },
	activeFactors: ActiveFactor[],
	priceBounds: PriceBounds,
): number | null {
	if (activeFactors.length === 0) return null

	let earned = 0
	let possible = 0

	for (const { factor, weight } of activeFactors) {
		earned +=
			weight * getFactorSatisfaction(listing, factor, priceBounds)
		possible += weight
	}

	return Math.round((earned / possible) * 100)
}

>>>>>>> Stashed changes
function StudentBrowseListings() {
	const [query, setQuery] = useState('')
	const [propertyType, setPropertyType] = useState('All Types')
	const [priceRange, setPriceRange] = useState('Any Price')
<<<<<<< Updated upstream
=======
	const [maxDistance, setMaxDistance] = useState(0)

	// Importance rating (1–5) per factor key; 0 or missing = not rated
	const [ratings, setRatings] = useState<Record<string, number>>({})
	const [minMatch, setMinMatch] = useState(0)
	const [showPreferences, setShowPreferences] = useState(false)

	const [universities, setUniversities] = useState<UniversityOption[]>([])
	const [selectedUniversityId, setSelectedUniversityId] = useState('')
>>>>>>> Stashed changes

	const [listings, setListings] = useState<Accommodation[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	const [studentName, setStudentName] = useState('')
	const [studentLoading, setStudentLoading] = useState(true)

	// Fetch accommodation listings
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

	const filteredListings = listings.filter((listing) => {
		const searchText = query.toLowerCase().trim()

<<<<<<< Updated upstream
		const matchesQuery =
			!searchText ||
			listing.title.toLowerCase().includes(searchText) ||
			listing.area.toLowerCase().includes(searchText) ||
			listing.description.toLowerCase().includes(searchText)
=======
	// Factors the student has rated. "Close to university" only counts
	// once a university is selected.
	const activeFactors: ActiveFactor[] = preferenceFactors
		.filter(
			(factor) =>
				(ratings[factor.key] ?? 0) > 0 &&
				(factor.key !== 'distance' || Boolean(selectedUniversity)),
		)
		.map((factor) => ({ factor, weight: ratings[factor.key] }))

	const preferencesActive = activeFactors.length > 0
	const ratedCount = Object.values(ratings).filter(
		(value) => value > 0,
	).length

	const prices = listings
		.map((listing) => listing.price)
		.filter(Number.isFinite)

	const priceBounds: PriceBounds = prices.length
		? { min: Math.min(...prices), max: Math.max(...prices) }
		: { min: 0, max: 0 }

	const filteredListings: ListingWithDistance[] = listings
		// 1. Attach the distance to the selected university
		.map((listing) => ({
			...listing,
			distanceKm: selectedUniversity
				? calculateDistanceKm(
						selectedUniversity.latitude,
						selectedUniversity.longitude,
						listing.latitude,
						listing.longitude,
					)
				: null,
		}))
		// 2. Score each listing against the student's preferences
		.map((listing) => ({
			...listing,
			matchScore: calculateMatchScore(
				listing,
				activeFactors,
				priceBounds,
			),
		}))
		// 3. Apply filters
		.filter((listing) => {
			const searchText = query.toLowerCase().trim()
>>>>>>> Stashed changes

		const matchesType =
			propertyType === 'All Types' ||
			getPropertyTypeLabel(listing.propertyType) === propertyType

		const matchesPrice = matchesPriceRange(listing.price, priceRange)

<<<<<<< Updated upstream
		return matchesQuery && matchesType && matchesPrice
	})
=======
			const matchesPrice = matchesPriceRange(
				listing.price,
				priceRange,
			)

			const matchesDistance =
				!selectedUniversity ||
				maxDistance === 0 ||
				(listing.distanceKm !== null &&
					listing.distanceKm <= maxDistance)

			const matchesMinMatch =
				minMatch === 0 ||
				(listing.matchScore !== null &&
					listing.matchScore >= minMatch)

			return (
				matchesQuery &&
				matchesType &&
				matchesPrice &&
				matchesDistance &&
				matchesMinMatch
			)
		})
		// 4. Rank by preference match first. Listings with the same match
		// score are then ordered nearest first (distance is only a tie-breaker
		// unless the student rated "Close to university" themselves).
		.sort((a, b) => {
			const matchDiff = (b.matchScore ?? -1) - (a.matchScore ?? -1)
			if (matchDiff !== 0) return matchDiff

			if (!selectedUniversity) return 0
			if (a.distanceKm === null && b.distanceKm === null) return 0
			if (a.distanceKm === null) return 1
			if (b.distanceKm === null) return -1
			return a.distanceKm - b.distanceKm
		})
>>>>>>> Stashed changes

	const studentInitial = studentName
		? studentName.charAt(0).toUpperCase()
		: 'S'

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
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">
							Browse Accommodation
						</h1>

						<p className="mt-1 text-sm text-slate-500">
							Explore verified rooms and apartments near your
							university.
						</p>
					</div>
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
								onChange={(event) =>
									setPropertyType(event.target.value)
								}
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

<<<<<<< Updated upstream
						<div className="relative lg:w-48">
							<select
								value={priceRange}
								onChange={(event) =>
									setPriceRange(event.target.value)
								}
								className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
							>
								{priceRanges.map((range) => (
									<option key={range} value={range}>
										{range}
									</option>
								))}
							</select>

							<ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
=======
						{universityError && (
							<p className="text-xs font-medium text-rose-600">
								{universityError}
							</p>
						)}

						<div className="flex flex-col gap-3 lg:flex-row">
							<div className="relative flex-1">
								<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

								<input
									type="text"
									value={query}
									onChange={(event) =>
										setQuery(event.target.value)
									}
									placeholder="Search by area or listing name"
									className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
								/>
							</div>

							<div className="relative lg:w-48">
								<select
									value={propertyType}
									onChange={(event) =>
										setPropertyType(
											event.target.value,
										)
									}
									className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
								>
									{propertyTypes.map((type) => (
										<option
											key={type}
											value={type}
										>
											{type}
										</option>
									))}
								</select>

								<ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
							</div>

							<div className="relative lg:w-48">
								<select
									value={priceRange}
									onChange={(event) =>
										setPriceRange(
											event.target.value,
										)
									}
									className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
								>
									{priceRanges.map((range) => (
										<option
											key={range}
											value={range}
										>
											{range}
										</option>
									))}
								</select>

								<ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
							</div>

							{/* Max distance – only useful once a university is selected */}
							{selectedUniversity && (
								<div className="relative lg:w-48">
									<select
										value={maxDistance}
										onChange={(event) =>
											setMaxDistance(
												Number(
													event.target.value,
												),
											)
										}
										className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
									>
										{distanceOptions.map((option) => (
											<option
												key={option.value}
												value={option.value}
											>
												{option.label}
											</option>
										))}
									</select>

									<ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
								</div>
							)}

							<button
								type="button"
								onClick={() =>
									setShowPreferences((open) => !open)
								}
								aria-expanded={showPreferences}
								className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition ${
									showPreferences || ratedCount > 0
										? 'border-blue-300 bg-blue-50 text-blue-600'
										: 'border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
								}`}
							>
								<SlidersHorizontal className="h-4 w-4" />
								Preferences
								{ratedCount > 0 && (
									<span className="grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1.5 text-xs font-bold text-white">
										{ratedCount}
									</span>
								)}
							</button>
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
				{showPreferences && (
					<div className="mt-4 rounded-[1.75rem] border border-slate-200/70 bg-white p-4 shadow-sm sm:p-5">
						<div className="flex flex-wrap items-start justify-between gap-3">
							<div className="max-w-xl">
								<h2 className="text-base font-black tracking-[-0.02em] text-slate-950">
									What matters most to you?
								</h2>

								<p className="mt-1 text-sm text-slate-500">
									Rate each factor from 1 (nice to have)
									to 5 (essential). Skip anything you
									don&apos;t care about. Listings are
									ranked by how well they match.
								</p>
							</div>

							<div className="flex items-center gap-3">
								<div className="relative">
									<select
										value={minMatch}
										onChange={(event) =>
											setMinMatch(
												Number(event.target.value),
											)
										}
										disabled={!preferencesActive}
										aria-label="Minimum match"
										className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
									>
										{minMatchOptions.map((option) => (
											<option
												key={option.value}
												value={option.value}
											>
												{option.label}
											</option>
										))}
									</select>

									<ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
								</div>

								<button
									type="button"
									onClick={() => {
										setRatings({})
										setMinMatch(0)
									}}
									disabled={ratedCount === 0}
									className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
								>
									Reset
								</button>
							</div>
						</div>

						<div className="mt-4 grid gap-3 md:grid-cols-2">
							{preferenceFactors.map((factor) => {
								const disabled =
									factor.key === 'distance' &&
									!selectedUniversity
								const current = ratings[factor.key] ?? 0

								return (
									<div
										key={factor.key}
										className={`flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 ${
											disabled ? 'opacity-50' : ''
										}`}
									>
										<div>
											<p className="text-sm font-semibold text-slate-800">
												{factor.label}
											</p>

											{disabled && (
												<p className="text-xs text-slate-400">
													Select a university first
												</p>
											)}
										</div>

										<div
											className="flex gap-1"
											role="group"
											aria-label={`Importance of ${factor.label}`}
										>
											{[1, 2, 3, 4, 5].map(
												(value) => (
													<button
														key={value}
														type="button"
														disabled={disabled}
														aria-pressed={
															current === value
														}
														aria-label={`${factor.label}: ${value} out of 5`}
														onClick={() =>
															setRatings(
																(previous) => ({
																	...previous,
																	// Clicking the same rating again clears it
																	[factor.key]:
																		previous[
																			factor.key
																		] === value
																			? 0
																			: value,
																}),
															)
														}
														className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-bold transition disabled:cursor-not-allowed ${
															value <= current
																? 'bg-blue-600 text-white'
																: 'border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'
														}`}
													>
														{value}
													</button>
												),
											)}
										</div>
									</div>
								)
							})}
						</div>
					</div>
				)}

				{selectedUniversity && (
					<div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
						<p className="text-sm text-blue-700">
							<span className="font-bold">
								Selected university:
							</span>{' '}
							{selectedUniversity.name}
							<span className="text-blue-500">
								{' '}
								—{' '}
								{preferencesActive
									? 'ranked by your preferences'
									: 'sorted by distance, nearest first'}
							</span>
						</p>
					</div>
				)}

>>>>>>> Stashed changes
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
							{preferencesActive
								? ' · ranked by your preferences'
								: ''}
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
											{listing.matchScore !== null && (
												<span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-blue-600 shadow-sm">
													<Sparkles className="h-3.5 w-3.5" />
													{listing.matchScore}% match
												</span>
											)}

											{listing.verified && (
												<span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-emerald-600 shadow-sm">
													<BadgeCheck className="h-3.5 w-3.5" />
													Verified
												</span>
											)}
										</div>

										<div className="p-5">
											<p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
												{getPropertyTypeLabel(
													listing.propertyType,
												)}
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
<<<<<<< Updated upstream
									Try a different area, property type, or price
									range.
=======
									Try a different area, property type,
									price range, distance, or minimum match.
>>>>>>> Stashed changes
								</p>
							</div>
						)}

						{filteredListings.length > 0 && (
							<div className="mt-8 flex items-center justify-between">
								<p className="text-sm text-slate-500">
									Showing 1–{filteredListings.length} of{' '}
									{listings.length}
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
