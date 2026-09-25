'use client'

import type { ReactNode, ComponentType } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
	LayoutDashboard,
	Home,
	PlusCircle,
	Users,
	LogOut,
	MapPin,
	MoreVertical,
	CheckCircle2,
	XCircle,
	Image as ImageIcon,
} from 'lucide-react'

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
}

const navItems = [
	{
		label: 'Dashboard',
		icon: LayoutDashboard,
		active: true,
		href: '/landlord/dashboard',
	},
	{
		label: 'My Listings',
		icon: Home,
		active: false,
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

const stats = [
	{
		label: 'Active Listings',
		value: '8',
		icon: Home,
		tint: 'bg-blue-50 text-blue-600',
	},
	{
		label: 'Pending Applications',
		value: '5',
		icon: Users,
		tint: 'bg-amber-50 text-amber-600',
	},
]

const applications = [
	{
		name: 'Meme Cathala',
		listing: 'Two room',
		date: 'Applied Sep 5',
	},
	{
		name: 'Nonko Cathala',
		listing: 'Single room',
		date: 'Applied Sep 5',
	},
]

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

			<p className="mt-1 text-sm text-slate-500">
				{label}
			</p>
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

function LandlordDashboard() {
	const [listings, setListings] = useState<
		Accommodation[]
	>([])

	const [loadingListings, setLoadingListings] =
		useState(true)

	const [listingsError, setListingsError] =
		useState('')

	useEffect(() => {
		const fetchListings = async () => {
			try {
				setLoadingListings(true)
				setListingsError('')

				const response = await fetch(
					'/api/accommodationlistings',
				)

				const data = await response.json()

				if (!response.ok) {
					throw new Error(
						data.error ||
							'Failed to load your accommodations.',
					)
				}

				setListings(
					(data.accommodations || []).map(
						(
							accommodation: Accommodation,
						) => ({
							...accommodation,

							// Make sure photos is always an array
							photos: Array.isArray(
								accommodation.photos,
							)
								? accommodation.photos
								: [],
						}),
					),
				)
			} catch (error) {
				console.error(
					'Failed to fetch dashboard listings:',
					error,
				)

				setListingsError(
					error instanceof Error
						? error.message
						: 'Failed to load your accommodations.',
				)
			} finally {
				setLoadingListings(false)
			}
		}

		fetchListings()
	}, [])

	return (
		<div className="flex min-h-screen bg-slate-50">
			{/* Sidebar */}
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

				{/* Landlord Profile */}
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

			{/* Main Content */}
			<main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">
				{/* Header */}
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">
							Welcome back, Khaya
						</h1>

						<p className="mt-1 text-sm text-slate-500">
							Here's how your listings are
							performing.
						</p>
					</div>

					<div className="flex items-center gap-3">
						<Link
							href="/landlord/addaccommodation"
							className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
						>
							<PlusCircle className="h-4 w-4" />
							Add Listing
						</Link>
					</div>
				</div>

				{/* Stats */}
				<div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{stats.map((stat) => (
						<StatCard
							key={stat.label}
							{...stat}
						/>
					))}
				</div>

				{/* Listings + Applications */}
				<div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
					{/* Listings */}
					<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">
								Your listings
							</h2>

							<Link
								href="/landlord/accommodationlisting"
								className="text-sm font-semibold text-blue-600 hover:text-blue-700"
							>
								Manage all
							</Link>
						</div>

						<div className="mt-5 space-y-4">
							{/* Loading */}
							{loadingListings && (
								<div className="rounded-2xl border border-slate-200/70 p-6 text-center">
									<p className="text-sm text-slate-500">
										Loading your
										accommodations...
									</p>
								</div>
							)}

							{/* Error */}
							{!loadingListings &&
								listingsError && (
									<div className="rounded-2xl border border-red-200 bg-red-50 p-5">
										<p className="text-sm font-medium text-red-600">
											{
												listingsError
											}
										</p>
									</div>
								)}

							{/* No listings */}
							{!loadingListings &&
								!listingsError &&
								listings.length ===
									0 && (
									<div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
										<Home className="mx-auto h-8 w-8 text-slate-300" />

										<p className="mt-3 text-sm font-semibold text-slate-700">
											No
											accommodations
											yet
										</p>

										<p className="mt-1 text-xs text-slate-500">
											Add your first
											accommodation
											to start
											receiving
											applications.
										</p>

										<Link
											href="/landlord/addaccommodation"
											className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
										>
											<PlusCircle className="h-4 w-4" />
											Add
											Accommodation
										</Link>
									</div>
								)}

							{/* Database Listings */}
							{!loadingListings &&
								!listingsError &&
								listings
									.slice(0, 3)
									.map(
										(
											listing,
										) => {
											const firstPhoto =
												listing
													.photos?.[0]

											return (
												<div
													key={
														listing.id
													}
													className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 p-4 transition hover:border-blue-200 hover:shadow-md sm:flex-row sm:items-center"
												>
													{/* Listing Image */}
													<div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 sm:w-32">
														{firstPhoto ? (
															<img
																src={
																	firstPhoto
																}
																alt={`${getPropertyTypeLabel(
																	listing.propertyType,
																)} in ${listing.area}`}
																className="h-full w-full object-cover"
															/>
														) : (
															<div className="flex h-full items-center justify-center">
																<ImageIcon className="h-8 w-8 text-white/80" />
															</div>
														)}

														{/* Photo count */}
														{listing
															.photos
															?.length >
															0 && (
															<div className="absolute bottom-1.5 right-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
																{
																	listing
																		.photos
																		.length
																}{' '}
																photo
																{listing
																	.photos
																	.length !==
																1
																	? 's'
																	: ''}
															</div>
														)}
													</div>

													<div className="flex-1">
														<div className="flex flex-wrap items-center gap-2">
															<h3 className="text-base font-bold text-slate-950">
																{getPropertyTypeLabel(
																	listing.propertyType,
																)}
															</h3>

															{listing.status ===
																'VERIFIED' && (
																<span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
																	Verified
																</span>
															)}

															{listing.status ===
																'PENDING_REVIEW' && (
																<span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-600">
																	Pending
																	review
																</span>
															)}

															{listing.status ===
																'INACTIVE' && (
																<span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
																	Inactive
																</span>
															)}
														</div>

														<p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
															<MapPin className="h-3.5 w-3.5" />
															{
																listing.area
															}
														</p>

														<div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
															<span className="font-bold text-slate-900">
																M
																{listing.price.toLocaleString()}{' '}
																/
																month
															</span>

															<span className="flex items-center gap-1 text-slate-500">
																<Users className="h-3.5 w-3.5" />
																0
																applicants
															</span>
														</div>
													</div>

													<button
														type="button"
														className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
														aria-label="More options"
													>
														<MoreVertical className="h-4 w-4" />
													</button>
												</div>
											)
										},
									)}
						</div>
					</section>

					{/* Applications */}
					<div className="space-y-6">
						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<h2 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">
								New applications
							</h2>

							<div className="mt-4 space-y-3">
								{applications.map(
									(
										application,
									) => (
										<div
											key={
												application.name
											}
											className="rounded-xl border border-slate-200/70 p-4"
										>
											<p className="text-sm font-bold text-slate-900">
												{
													application.name
												}
											</p>

											<p className="mt-0.5 text-xs font-medium text-blue-600">
												{
													application.listing
												}
											</p>

											<p className="mt-1 text-xs text-slate-500">
												{
													application.date
												}
											</p>

											<div className="mt-3 flex gap-2">
												<button
													type="button"
													className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-600 transition hover:bg-emerald-100"
												>
													<CheckCircle2 className="h-3.5 w-3.5" />
													Approve
												</button>

												<button
													type="button"
													className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
												>
													<XCircle className="h-3.5 w-3.5" />
													Decline
												</button>
											</div>
										</div>
									),
								)}
							</div>
						</section>
					</div>
				</div>
			</main>
		</div>
	)
}

export default LandlordDashboard
