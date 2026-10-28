'use client'

import { useEffect, useState } from 'react'
import type { ReactNode, ComponentType } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
	Menu,
	X,
	Image as ImageIcon,
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
		label: 'Profile',
		icon: Users,
		active: false,
		href: '/profile',
	},
]

const filterTabs = ['All', 'Available', 'Occupied', 'Inactive']

type Accommodation = {
	id: string
	description: string
	area: string
	price: number
	propertyType: string
	amenities: string[]
	photos: string[]
	availableFrom: string | null
	status: string
	latitude: number
	longitude: number
	createdAt: string
	updatedAt: string
	roomIdentifier: string | null
	// Comment left by an admin when a listing needs changes
	adminNote?: string | null
	adminNoteAt?: string | null
}

type AvailabilityStatus = 'AVAILABLE' | 'OCCUPIED'

const statusStyles: Record<
	string,
	{
		tint: string
		icon: ComponentType<{ className?: string }>
	}
> = {
	Available: {
		tint: 'bg-emerald-50 text-emerald-600',
		icon: BadgeCheck,
	},
	Occupied: {
		tint: 'bg-rose-50 text-rose-600',
		icon: PauseCircle,
	},
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
		case 'OCCUPIED':
			return 'Occupied'
		case 'AVAILABLE':
			return 'Available'
		default:
			return status
	}
}

function NavButton({
	label,
	icon: Icon,
	active,
	href,
	onClick,
}: {
	label: string
	icon: ComponentType<{ className?: string }>
	active: boolean
	href: string
	onClick?: () => void
}) {
	return (
		<Link
			href={href}
			onClick={onClick}
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

/*
 * Top bar for screens smaller than lg, where the sidebar is hidden.
 * It holds the logo, a menu button, and a dropdown with the same
 * navigation, landlord card, and log out button as the sidebar.
 */
function MobileNav({
	displayName,
	initial,
	profileLoading,
	onLogout,
}: {
	displayName: string
	initial: string
	profileLoading: boolean
	onLogout: () => void
}) {
	const [open, setOpen] = useState(false)

	return (
		<header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white lg:hidden">
			<div className="flex items-center justify-between px-4 py-3">
				<Link href="/" className="flex items-center gap-2.5">
					<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-base font-bold text-white shadow-lg shadow-blue-600/25">
						⌂
					</div>

					<p className="text-lg font-black tracking-[-0.03em] text-slate-950">
						Stay<span className="text-blue-600">Match</span>
					</p>
				</Link>

				<button
					type="button"
					onClick={() => setOpen((value) => !value)}
					aria-expanded={open}
					aria-controls="mobile-menu"
					aria-label={open ? 'Close menu' : 'Open menu'}
					className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100"
				>
					{open ? (
						<X className="h-5 w-5" />
					) : (
						<Menu className="h-5 w-5" />
					)}
				</button>
			</div>

			{open && (
				<div
					id="mobile-menu"
					className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-100 px-4 pb-4 pt-3"
				>
					<nav className="space-y-1">
						{navItems.map((item) => (
							<NavButton
								key={item.label}
								{...item}
								onClick={() => setOpen(false)}
							/>
						))}
					</nav>

					<div className="mt-3 rounded-2xl bg-slate-50 p-3">
						<div className="flex items-center gap-3">
							<div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
								{profileLoading ? '...' : initial}
							</div>

							<div className="min-w-0">
								<p className="truncate text-sm font-bold text-slate-900">
									{profileLoading ? 'Loading...' : displayName}
								</p>
								<p className="text-xs text-slate-500">Landlord</p>
							</div>
						</div>
					</div>

					<button
						type="button"
						onClick={() => {
							setOpen(false)
							onLogout()
						}}
						className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
					>
						<LogOut className="h-4 w-4" />
						Log out
					</button>
				</div>
			)}
		</header>
	)
}

function AccommodationListings() {
	const router = useRouter()

	const [activeFilter, setActiveFilter] = useState('All')
	const [query, setQuery] = useState('')
	const [propertyTypeFilter, setPropertyTypeFilter] =
		useState('All Types')

	const [listings, setListings] = useState<Accommodation[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(
		null,
	)

	const [landlordName, setLandlordName] = useState('')
	const [profileLoading, setProfileLoading] = useState(true)

	// Logged-in landlord's profile
	useEffect(() => {
		let mounted = true

		const fetchProfile = async () => {
			try {
				const response = await fetch('/api/profile')
				const data = await response.json().catch(() => null)

				if (!response.ok || !data) {
					throw new Error(
						data?.error ||
							`Failed to load profile (${response.status}).`,
					)
				}

				if (mounted) {
					setLandlordName(data.user?.name ?? data.name ?? '')
				}
			} catch (error) {
				console.warn('Failed to fetch profile:', error)

				if (mounted) setLandlordName('')
			} finally {
				if (mounted) setProfileLoading(false)
			}
		}

		fetchProfile()

		return () => {
			mounted = false
		}
	}, [])

	useEffect(() => {
		const fetchAccommodations = async () => {
			try {
				setLoading(true)
				setError('')

				const response = await fetch('/api/accommodationlistings')
				const data = await response.json()

				if (!response.ok) {
					throw new Error(
						data.error || 'Failed to load accommodations.',
					)
				}

				setListings(
					(data.accommodations || []).map(
						(accommodation: Accommodation) => ({
							...accommodation,
							photos: Array.isArray(accommodation.photos)
								? accommodation.photos
								: [],
							roomIdentifier:
								typeof accommodation.roomIdentifier ===
									'string' &&
								accommodation.roomIdentifier.trim()
									? accommodation.roomIdentifier.trim()
									: null,
						}),
					),
				)
			} catch (error) {
				console.error('Failed to fetch accommodations:', error)

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

	const handleLogout = async () => {
		try {
			await fetch('/api/auth/logout', { method: 'POST' })
		} catch (error) {
			console.warn('Logout request failed:', error)
		}

		router.push('/')
	}

	const handleAvailabilityChange = async (
		listingId: string,
		newStatus: AvailabilityStatus,
	) => {
		try {
			setUpdatingStatusId(listingId)
			setError('')

			const response = await fetch(
				`/api/accommodationlistings/${listingId}`,
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						status: newStatus,
					}),
				},
			)
			const data = await response.json()

			if (!response.ok) {
				throw new Error(
					data.error || 'Failed to update room availability.',
				)
			}

			setListings((currentListings) =>
				currentListings.map((listing) =>
					listing.id === listingId
						? { ...listing, status: newStatus }
						: listing,
				),
			)
		} catch (error) {
			console.error('Failed to update availability:', error)

			setError(
				error instanceof Error
					? error.message
					: 'Failed to update room availability.',
			)
		} finally {
			setUpdatingStatusId(null)
		}
	}

	const filteredListings = listings.filter((listing) => {
		const displayStatus = getDisplayStatus(listing.status)

		const matchesFilter =
			activeFilter === 'All' || displayStatus === activeFilter

		const matchesPropertyType =
			propertyTypeFilter === 'All Types' ||
			getPropertyTypeLabel(listing.propertyType) ===
				propertyTypeFilter

		const searchText = `
			${getPropertyTypeLabel(listing.propertyType)}
			${listing.roomIdentifier ?? ''}
			${listing.area}
			${listing.description}
		`.toLowerCase()

		const matchesQuery = searchText.includes(
			query.toLowerCase().trim(),
		)

		return matchesFilter && matchesPropertyType && matchesQuery
	})

	const needsChangesCount = listings.filter(
		(listing) => listing.status === 'INACTIVE' && listing.adminNote,
	).length

	const displayName = landlordName || 'Landlord'
	const initial = displayName.charAt(0).toUpperCase()

	return (
		<div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
			{/* Mobile and tablet: top bar with a menu (the sidebar is hidden below lg) */}
			<MobileNav
				displayName={displayName}
				initial={initial}
				profileLoading={profileLoading}
				onLogout={handleLogout}
			/>

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
								{profileLoading ? '...' : initial}
							</div>

							<div className="min-w-0">
								<p className="truncate text-sm font-bold text-slate-900">
									{profileLoading ? 'Loading...' : displayName}
								</p>
								<p className="text-xs text-slate-500">
									Landlord
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

			<main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-10">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div className="min-w-0">
						<h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">
							My Listings
						</h1>

						<p className="mt-1 text-sm text-slate-500">
							Manage, edit, and track every property you&apos;ve
							published.
						</p>
					</div>

					<Link
						href="/landlord/addaccommodation"
						className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 sm:w-auto"
					>
						<PlusCircle className="h-4 w-4" />
						Add Listing
					</Link>
				</div>

				{/* Summary when an admin has asked for changes */}
				{!loading && needsChangesCount > 0 && (
					<div
						role="alert"
						className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800"
					>
						{needsChangesCount === 1
							? '1 listing needs changes.'
							: `${needsChangesCount} listings need changes.`}{' '}
						<span className="font-medium text-amber-700">
							They are hidden from students until you edit and save
							them.
						</span>
					</div>
				)}

				<div className="mt-5 rounded-2xl border border-slate-200/70 bg-white p-3 shadow-sm sm:mt-6 sm:rounded-[1.75rem] sm:p-5">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
						<div className="flex flex-wrap gap-2">
							{filterTabs.map((tab) => (
								<button
									key={tab}
									type="button"
									onClick={() => setActiveFilter(tab)}
									className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
										activeFilter === tab
											? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
											: 'bg-slate-50 text-slate-600 hover:bg-slate-100'
									}`}
								>
									{tab}
								</button>
							))}
						</div>

						<div className="flex flex-col gap-3 sm:flex-row">
							<div className="relative flex-1 sm:flex-none">
								<Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

								<input
									type="text"
									value={query}
									onChange={(event) =>
										setQuery(event.target.value)
									}
									placeholder="Search by room, area or type"
									className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-base text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:w-64 sm:text-sm"
								/>
							</div>

							<div className="relative">
								<select
									value={propertyTypeFilter}
									onChange={(event) =>
										setPropertyTypeFilter(
											event.target.value,
										)
									}
									className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-9 text-base font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:w-auto sm:text-sm"
								>
									<option>All Types</option>
									<option>Single Room</option>
									<option>Double</option>
									<option>Commune</option>
									<option>Bachelor</option>
								</select>

								<ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
							</div>
						</div>
					</div>
				</div>

				{loading && (
					<div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center sm:p-10">
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

				{/* Keep the list visible if a later action (e.g. changing
				    availability) fails, so one error doesn't hide everything */}
				{!loading && (!error || listings.length > 0) && (
					<>
						<p className="mt-5 text-sm text-slate-500">
							<span className="font-bold text-slate-950">
								{filteredListings.length}
							</span>{' '}
							of {listings.length} listings
						</p>

						<div className="mt-4 grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
							{filteredListings.map((listing) => {
								const displayStatus = getDisplayStatus(
									listing.status,
								)

								const style = statusStyles[displayStatus]

								if (!style) {
									return null
								}

								const StatusIcon = style.icon
								const firstPhoto = listing.photos?.[0]

								const typeLabel = getPropertyTypeLabel(
									listing.propertyType,
								)

								// INACTIVE is only ever set by an administrator
								const isHidden = listing.status === 'INACTIVE'
								const needsChanges =
									isHidden && Boolean(listing.adminNote)

								const canUpdateAvailability = [
									'AVAILABLE',
									'OCCUPIED',
									'Available',
									'Occupied',
								].includes(listing.status)

								const availabilityValue =
									listing.status === 'OCCUPIED' ||
									listing.status === 'Occupied'
										? 'OCCUPIED'
										: 'AVAILABLE'

								return (
									<article
										key={listing.id}
										className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
									>
										<div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 sm:h-40">
											{firstPhoto ? (
												// eslint-disable-next-line @next/next/no-img-element
												<img
													src={firstPhoto}
													alt={`${typeLabel}${
														listing.roomIdentifier
															? ` ${listing.roomIdentifier}`
															: ''
													} in ${listing.area}`}
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="flex h-full w-full flex-col items-center justify-center text-white/80">
													<ImageIcon className="h-10 w-10" />
													<span className="mt-2 text-xs font-semibold">
														No photo available
													</span>
												</div>
											)}

											<div className="absolute inset-0 bg-black/10" />

											<span
												className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${style.tint}`}
											>
												<StatusIcon className="h-3.5 w-3.5" />
												{needsChanges
													? 'Needs changes'
													: displayStatus}
											</span>

											<button
												type="button"
												className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-slate-500 shadow-sm transition hover:text-slate-700 sm:h-8 sm:w-8"
												aria-label="More options"
											>
												<MoreVertical className="h-4 w-4" />
											</button>

											{listing.photos?.length > 0 && (
												<div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
													{listing.photos.length} photo
													{listing.photos.length !== 1
														? 's'
														: ''}
												</div>
											)}
										</div>

										<div className="p-4 sm:p-5">
											<h3 className="text-base font-bold text-slate-950">
												{typeLabel}
											</h3>

											{listing.roomIdentifier && (
												<p className="mt-1 flex items-center gap-1.5 break-words text-sm font-bold text-blue-600">
													Room: {listing.roomIdentifier}
												</p>
											)}

											<p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
												<MapPin className="h-3.5 w-3.5 shrink-0" />
												<span className="break-words">
													{listing.area}
												</span>
											</p>

											<p className="mt-3 text-lg font-black tracking-[-0.02em] text-slate-950">
												M{listing.price.toLocaleString()}{' '}
												/ month
											</p>

											{/* Admin's comment */}
											{needsChanges && (
												<div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs">
													<p className="font-bold text-amber-800">
														Changes requested by the admin
													</p>

													<p className="mt-1 line-clamp-4 whitespace-pre-wrap break-words text-amber-900">
														{listing.adminNote}
													</p>
												</div>
											)}

											<div className="mt-4 flex flex-wrap gap-2">
												<Link
													href={`/landlord/accommodationdetails?id=${listing.id}`}
													className="flex min-w-[7rem] flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-600 sm:py-2"
												>
													<Eye className="h-3.5 w-3.5" />
													View Details
												</Link>

												<Link
													href={`/landlord/accommodationlisting/edit?id=${listing.id}`}
													className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-bold text-white transition sm:py-2 ${
														needsChanges
															? 'bg-amber-600 hover:bg-amber-700'
															: 'bg-blue-600 hover:bg-blue-700'
													}`}
												>
													<Pencil className="h-3.5 w-3.5" />
													{needsChanges ? 'Fix listing' : 'Edit'}
												</Link>

												<DeleteAccommodation
													accommodationId={listing.id}
													onDeleted={() => {
														setListings(
															(currentListings) =>
																currentListings.filter(
																	(item) =>
																		item.id !==
																		listing.id,
																),
														)
													}}
												/>
											</div>

											<div className="mt-4 border-t border-slate-100 pt-4">
												{isHidden ? (
													<p className="text-xs font-semibold text-slate-500">
														{needsChanges
															? 'Hidden from students. Edit the listing and save to put it back online.'
															: 'Hidden from students by an administrator.'}
													</p>
												) : (
													<>
														<label
															htmlFor={`availability-${listing.id}`}
															className="mb-2 block text-xs font-bold text-slate-600"
														>
															Room availability
														</label>

														<select
															id={`availability-${listing.id}`}
															value={availabilityValue}
															disabled={
																updatingStatusId ===
																	listing.id ||
																!canUpdateAvailability
															}
															onChange={(event) => {
																const newStatus =
																	event.target.value

																if (
																	newStatus ===
																		'AVAILABLE' ||
																	newStatus ===
																		'OCCUPIED'
																) {
																	handleAvailabilityChange(
																		listing.id,
																		newStatus,
																	)
																}
															}}
															className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 sm:text-sm"
														>
															<option value="AVAILABLE">
																Available
															</option>
															<option value="OCCUPIED">
																Occupied / Rented
															</option>
														</select>

														{updatingStatusId ===
															listing.id && (
															<p className="mt-2 text-xs font-medium text-blue-600">
																Updating availability...
															</p>
														)}
													</>
												)}
											</div>
										</div>
									</article>
								)
							})}
						</div>

						{filteredListings.length === 0 && (
							<div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center sm:mt-10 sm:p-10">
								<p className="text-sm font-semibold text-slate-600">
									No listings match your filters.
								</p>

								<p className="mt-1 text-sm text-slate-400">
									Try a different status or search term.
								</p>
							</div>
						)}

						<div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
							<p className="text-sm text-slate-500">
								Showing 1–{filteredListings.length} of{' '}
								{listings.length}
							</p>

							<div className="flex items-center gap-2">
								<button
									type="button"
									className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-blue-300 hover:text-blue-600 sm:h-9 sm:w-9"
									aria-label="Previous page"
								>
									<ChevronLeft className="h-4 w-4" />
								</button>

								<button
									type="button"
									className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 text-sm font-bold text-white sm:h-9 sm:w-9"
								>
									1
								</button>

								<button
									type="button"
									className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-blue-300 hover:text-blue-600 sm:h-9 sm:w-9"
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