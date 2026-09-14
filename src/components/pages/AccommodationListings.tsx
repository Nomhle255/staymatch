'use client'

import { useEffect, useState } from 'react'
import type { ReactNode, ComponentType } from 'react'
import Link from 'next/link'
import DeleteAccommodation from '@/components/pages/DeleteAccommodation'
import {
	LayoutDashboard,
	Home,
	PlusCircle,
	Users,
	LogOut,
	Search,
	MapPin,
	BadgeCheck,
	Clock,
	PauseCircle,
	Pencil,
	MoreVertical,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Eye,
} from 'lucide-react'

const navItems = [
	{
		label: 'Dashboard',
		icon: LayoutDashboard,
		active: false,
		href: '/landlord/dashboard',
	},
	{
		label: 'My Listings',
		icon: Home,
		active: true,
		href: '/landlord/accommodationlisting',
	},
	{
		label: 'Add Listing',
		icon: PlusCircle,
		active: false,
		href: '/landlord/addaccommodation',
	},
	{
		label: 'Applications',
		icon: Users,
		active: false,
		href: '/landlord/applications',
	},
]

const filterTabs = [
	'All',
	'Verified',
	'Pending review',
	'Inactive',
]

type Accommodation = {
	id: string
	description: string
	area: string
	price: number
	propertyType: string
	amenities: string[]
	availableFrom: string | null
	status: string
	latitude: number
	longitude: number
	createdAt: string
	updatedAt: string
}

const statusStyles: Record<
	string,
	{
		tint: string
		icon: ComponentType<{ className?: string }>
	}
> = {
	Verified: {
		tint: 'bg-emerald-50 text-emerald-600',
		icon: BadgeCheck,
	},
	'Pending review': {
		tint: 'bg-amber-50 text-amber-600',
		icon: Clock,
	},
	Inactive: {
		tint: 'bg-slate-100 text-slate-500',
		icon: PauseCircle,
	},
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

function getDisplayStatus(status: string) {
	switch (status) {
		case 'VERIFIED':
			return 'Verified'

		case 'PENDING_REVIEW':
			return 'Pending review'

		case 'INACTIVE':
			return 'Inactive'

		default:
			return status
	}
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

function SidebarShell({
	children,
}: {
	children: ReactNode
}) {
	return (
		<aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-200/70 bg-white px-4 py-6 lg:flex">
			{children}
		</aside>
	)
}

function AccommodationListings() {
	const [activeFilter, setActiveFilter] = useState('All')
	const [query, setQuery] = useState('')

	const [listings, setListings] = useState<
		Accommodation[]
	>([])

	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		const fetchAccommodations = async () => {
			try {
				setLoading(true)
				setError('')

				const response = await fetch(
					'/api/accommodationlistings',
				)

				const data = await response.json()

				if (!response.ok) {
					throw new Error(
						data.error ||
							'Failed to load accommodations.',
					)
				}

				setListings(data.accommodations || [])
			} catch (error) {
				console.error(
					'Failed to fetch accommodations:',
					error,
				)

				setError(
					error instanceof Error
						? error.message
						: 'Failed to load accommodations.',
				)
			} finally {
				setLoading(false)
			}
		}

		fetchAccommodations()
	}, [])

	const filteredListings = listings.filter(
		(listing) => {
			const displayStatus =
				getDisplayStatus(listing.status)

			const matchesFilter =
				activeFilter === 'All' ||
				displayStatus === activeFilter

			const searchText = `
				${getPropertyTypeLabel(listing.propertyType)}
				${listing.area}
				${listing.description}
			`.toLowerCase()

			const matchesQuery = searchText.includes(
				query.toLowerCase(),
			)

			return matchesFilter && matchesQuery
		},
	)

	return (
		<div className="flex min-h-screen bg-slate-50">
			<SidebarShell>
				<div>
					<Link
						href="/"
						className="flex items-center gap-3 px-2"
					>
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/25">
							⌂
						</div>

						<p className="text-lg font-black tracking-[-0.03em] text-slate-950">
							Stay
							<span className="text-blue-600">
								Match
							</span>
						</p>
					</Link>

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
								K
							</div>

							<div>
								<p className="text-sm font-bold text-slate-900">
									Khaya Cathala
								</p>

								<p className="text-xs text-slate-500">
									Landlord
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
							My Listings
						</h1>

						<p className="mt-1 text-sm text-slate-500">
							Manage, edit, and track every
							property you've published.
						</p>
					</div>

					<Link
						href="/landlord/addaccommodation"
						className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
					>
						<PlusCircle className="h-4 w-4" />
						Add Listing
					</Link>
				</div>

				<div className="mt-6 rounded-[1.75rem] border border-slate-200/70 bg-white p-4 shadow-sm sm:p-5">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
						<div className="flex flex-wrap gap-2">
							{filterTabs.map((tab) => (
								<button
									key={tab}
									type="button"
									onClick={() =>
										setActiveFilter(
											tab,
										)
									}
									className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
										activeFilter ===
										tab
											? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
											: 'bg-slate-50 text-slate-600 hover:bg-slate-100'
									}`}
								>
									{tab}
								</button>
							))}
						</div>

						<div className="flex gap-3">
							<div className="relative">
								<Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

								<input
									type="text"
									value={query}
									onChange={(
										event,
									) =>
										setQuery(
											event
												.target
												.value,
										)
									}
									placeholder="Search your listings"
									className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:w-64"
								/>
							</div>

							<div className="relative">
								<select className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100">
									<option>
										Newest first
									</option>
									<option>
										Most viewed
									</option>
									<option>
										Most applicants
									</option>
									<option>
										Price: low to high
									</option>
									<option>
										Price: high to low
									</option>
								</select>

								<ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
							</div>
						</div>
					</div>
				</div>

				{loading && (
					<div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
						<p className="text-sm font-semibold text-slate-600">
							Loading your accommodations...
						</p>
					</div>
				)}

				{error && !loading && (
					<div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
						{error}
					</div>
				)}

				{!loading && !error && (
					<>
						<p className="mt-5 text-sm text-slate-500">
							<span className="font-bold text-slate-950">
								{
									filteredListings.length
								}
							</span>{' '}
							of {listings.length}{' '}
							listings
						</p>

						<div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
							{filteredListings.map(
								(listing) => {
									const displayStatus =
										getDisplayStatus(
											listing.status,
										)

									const style =
										statusStyles[
											displayStatus
										]

									if (!style) {
										return null
									}

									const StatusIcon =
										style.icon

									return (
										<article
											key={
												listing.id
											}
											className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
										>
											<div className="relative h-40 bg-gradient-to-br from-blue-400 to-indigo-500">
												<span
													className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${style.tint}`}
												>
													<StatusIcon className="h-3.5 w-3.5" />
													{
														displayStatus
													}
												</span>

												<button
													type="button"
													className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-slate-500 shadow-sm transition hover:text-slate-700"
													aria-label="More options"
												>
													<MoreVertical className="h-4 w-4" />
												</button>
											</div>

											<div className="p-5">
												<h3 className="text-base font-bold text-slate-950">
													{getPropertyTypeLabel(
														listing.propertyType,
													)}
												</h3>

												<p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
													<MapPin className="h-3.5 w-3.5" />
													{
														listing.area
													}
												</p>

												<p className="mt-3 text-lg font-black tracking-[-0.02em] text-slate-950">
													M
													{listing.price.toLocaleString()}{' '}
													/ month
												</p>

												<div className="mt-4 flex gap-2">
													<Link
														href={`/landlord/accommodationdetails?id=${listing.id}`}														className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
													>
														<Eye className="h-3.5 w-3.5" />
														View Details
													</Link>

													<Link
														href={`/landlord/accommodationlisting/edit?id=${listing.id}`}
														className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
													>
														<Pencil className="h-3.5 w-3.5" />
														Edit
													</Link>

													<DeleteAccommodation
														accommodationId={listing.id}
														onDeleted={() => {
															setListings(currentListings =>
																currentListings.filter(item => item.id !== listing.id)
															)
														}}
													/>
												</div>
											</div>
										</article>
									)
								},
							)}
						</div>

						{filteredListings.length ===
							0 && (
							<div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
								<p className="text-sm font-semibold text-slate-600">
									No listings match your
									filters.
								</p>

								<p className="mt-1 text-sm text-slate-400">
									Try a different status
									or search term.
								</p>
							</div>
						)}

						<div className="mt-8 flex items-center justify-between">
							<p className="text-sm text-slate-500">
								Showing 1–
								{
									filteredListings.length
								}{' '}
								of {listings.length}
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
					</>
				)}
			</main>
		</div>
	)
}

export default AccommodationListings