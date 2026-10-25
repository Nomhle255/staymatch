'use client'

import { Suspense, useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
	Search,
	MapPin,
	BadgeCheck,
	Clock,
	PauseCircle,
	ChevronDown,
	DoorClosed,
	X,
	Image as ImageIcon,
	Eye,
	MessageSquare,
} from 'lucide-react'
import AdminShell from '@/components/pages/AdminShell'

type AdminAccommodation = {
	id: string
	roomIdentifier: string | null
	area: string
	price: number
	propertyType: string
	status: string
	availableFrom: string | null
	createdAt: string
	landlordId: string
	landlordName: string
	landlordEmail: string
	landlordPhone: string | null
	photo: string | null
	photoCount: number
	// Latest admin comment (optional until the list API returns it)
	adminNote?: string | null
	adminNoteAt?: string | null
}

const statusOptions = [
	{ label: 'All statuses', value: 'ALL' },
	{ label: 'Available', value: 'AVAILABLE' },
	{ label: 'Occupied', value: 'OCCUPIED' },
	{ label: 'Inactive', value: 'INACTIVE' },
	{ label: 'Pending review', value: 'PENDING_REVIEW' },
]

const statusStyles: Record<
	string,
	{
		label: string
		tint: string
		icon: ComponentType<{ className?: string }>
	}
> = {
	AVAILABLE: {
		label: 'Available',
		tint: 'bg-emerald-50 text-emerald-600',
		icon: BadgeCheck,
	},
	OCCUPIED: {
		label: 'Occupied',
		tint: 'bg-rose-50 text-rose-600',
		icon: PauseCircle,
	},
	INACTIVE: {
		label: 'Inactive',
		tint: 'bg-slate-100 text-slate-500',
		icon: PauseCircle,
	},
	PENDING_REVIEW: {
		label: 'Pending review',
		tint: 'bg-amber-50 text-amber-600',
		icon: Clock,
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

function formatDate(value: string) {
	const date = new Date(value)

	if (Number.isNaN(date.getTime())) return '—'

	return date.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	})
}

function StatCard({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
			<p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
				{label}
			</p>

			<p className="mt-1 text-2xl font-black tracking-[-0.03em] text-slate-950">
				{value}
			</p>
		</div>
	)
}

function AdminAccommodations() {
	const searchParams = useSearchParams()

	// Set when arriving from a landlord's "View listings" button
	const landlordFilter = searchParams.get('landlord')

	const [accommodations, setAccommodations] = useState<
		AdminAccommodation[]
	>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	const [query, setQuery] = useState('')
	const [statusFilter, setStatusFilter] = useState('ALL')

	// Review dialog state
	const [reviewTarget, setReviewTarget] =
		useState<AdminAccommodation | null>(null)
	const [comment, setComment] = useState('')
	const [markIncomplete, setMarkIncomplete] = useState(false)
	const [reviewSaving, setReviewSaving] = useState(false)
	const [reviewError, setReviewError] = useState('')

	useEffect(() => {
		const fetchAccommodations = async () => {
			try {
				setLoading(true)
				setError('')

				const response = await fetch('/api/admin/accommodation')

				const data = await response.json().catch(() => null)

				if (!response.ok || !data) {
					throw new Error(
						data?.error || 'Failed to load accommodations.',
					)
				}

				setAccommodations(data.accommodations ?? [])
			} catch (error) {
				console.error('Failed to load accommodations:', error)

				setError(
					error instanceof Error
						? error.message
						: 'Something went wrong while loading accommodations.',
				)
			} finally {
				setLoading(false)
			}
		}

		fetchAccommodations()
	}, [])

	const openReview = (item: AdminAccommodation) => {
		setReviewTarget(item)
		setComment('')
		setMarkIncomplete(false)
		setReviewError('')
	}

	const closeReview = () => {
		if (reviewSaving) return
		setReviewTarget(null)
	}

	// Close the dialog with the Escape key
	useEffect(() => {
		if (!reviewTarget) return

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && !reviewSaving) {
				setReviewTarget(null)
			}
		}

		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [reviewTarget, reviewSaving])

	const submitReview = async (event: React.FormEvent) => {
		event.preventDefault()

		if (!reviewTarget) return

		if (!comment.trim()) {
			setReviewError('Please write a comment explaining what is missing.')
			return
		}

		setReviewSaving(true)
		setReviewError('')

		try {
			const response = await fetch(
				`/api/admin/accommodation/${reviewTarget.id}/review`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						comment: comment.trim(),
						markIncomplete,
					}),
				},
			)

			const data = await response.json().catch(() => null)

			if (!response.ok || !data?.accommodation) {
				setReviewError(
					data?.error || 'We couldn’t save your review. Please try again.',
				)
				return
			}

			const updated = data.accommodation

			// Update the card in place so no reload is needed
			setAccommodations((current) =>
				current.map((item) =>
					item.id === updated.id
						? {
								...item,
								status: updated.status,
								adminNote: updated.adminNote,
								adminNoteAt: updated.adminNoteAt,
							}
						: item,
				),
			)

			setReviewTarget(null)
		} catch (error) {
			console.error('Review error:', error)
			setReviewError(
				'We couldn’t reach the server. Please check your connection and try again.',
			)
		} finally {
			setReviewSaving(false)
		}
	}

	const filteredAccommodations = accommodations.filter((item) => {
		const text = `${getPropertyTypeLabel(item.propertyType)} ${
			item.roomIdentifier ?? ''
		} ${item.area} ${item.landlordName} ${item.landlordEmail}`.toLowerCase()

		const matchesQuery = text.includes(query.toLowerCase().trim())

		const matchesStatus =
			statusFilter === 'ALL' || item.status === statusFilter

		const matchesLandlord =
			!landlordFilter || item.landlordId === landlordFilter

		return matchesQuery && matchesStatus && matchesLandlord
	})

	const selectedLandlordName = landlordFilter
		? (accommodations.find(
				(item) => item.landlordId === landlordFilter,
			)?.landlordName ?? 'Selected landlord')
		: null

	const liveCount = accommodations.filter(
		(item) => item.status === 'AVAILABLE',
	).length

	const occupiedCount = accommodations.filter(
		(item) => item.status === 'OCCUPIED',
	).length

	return (
		<AdminShell
			active="accommodations"
			title="Accommodation"
			subtitle="Every listing added to StayMatch, across all landlords."
		>
			{!loading && !error && (
				<div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
					<StatCard label="Listings" value={accommodations.length} />
					<StatCard label="Available" value={liveCount} />
					<StatCard label="Occupied" value={occupiedCount} />
				</div>
			)}

			{loading && (
				<div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
					<p className="text-sm font-semibold text-slate-600">
						Loading accommodations...
					</p>
				</div>
			)}

			{error && !loading && (
				<div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
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
					<div className="mt-6 rounded-[1.75rem] border border-slate-200/70 bg-white p-4 shadow-sm sm:p-5">
						<div className="flex flex-col gap-3 lg:flex-row">
							<div className="relative flex-1">
								<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

								<input
									type="text"
									value={query}
									onChange={(event) =>
										setQuery(event.target.value)
									}
									placeholder="Search by room, area, type or landlord"
									className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
								/>
							</div>

							<div className="relative lg:w-52">
								<select
									value={statusFilter}
									onChange={(event) =>
										setStatusFilter(event.target.value)
									}
									className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
								>
									{statusOptions.map((option) => (
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
						</div>

						{selectedLandlordName && (
							<div className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
								Landlord: {selectedLandlordName}

								<Link
									href="/admin/accommodations"
									aria-label="Clear landlord filter"
									className="grid h-4 w-4 place-items-center rounded-full hover:bg-blue-100"
								>
									<X className="h-3 w-3" />
								</Link>
							</div>
						)}
					</div>

					<p className="mt-5 text-sm text-slate-500">
						<span className="font-bold text-slate-950">
							{filteredAccommodations.length}
						</span>{' '}
						of {accommodations.length} listings
					</p>

					{filteredAccommodations.length === 0 ? (
						<div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
							<p className="text-sm font-semibold text-slate-600">
								No listings match your filters.
							</p>
						</div>
					) : (
						<div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
							{filteredAccommodations.map((item) => {
								const style =
									statusStyles[item.status] ??
									statusStyles.INACTIVE

								const StatusIcon = style.icon

								return (
									<article
										key={item.id}
										className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm"
									>
										<div className="relative h-40 overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500">
											{item.photo ? (
												// eslint-disable-next-line @next/next/no-img-element
												<img
													src={item.photo}
													alt={`${getPropertyTypeLabel(
														item.propertyType,
													)} in ${item.area}`}
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

											<span
												className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${style.tint}`}
											>
												<StatusIcon className="h-3.5 w-3.5" />
												{style.label}
											</span>

											{item.photoCount > 0 && (
												<span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
													{item.photoCount} photo
													{item.photoCount !== 1
														? 's'
														: ''}
												</span>
											)}
										</div>

										<div className="p-5">
											<h3 className="text-base font-bold text-slate-950">
												{getPropertyTypeLabel(
													item.propertyType,
												)}
											</h3>

											{item.roomIdentifier && (
												<p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-blue-600">
													<DoorClosed className="h-3.5 w-3.5" />
													{item.roomIdentifier}
												</p>
											)}

											<p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
												<MapPin className="h-3.5 w-3.5" />
												{item.area}
											</p>

											<p className="mt-3 text-lg font-black tracking-[-0.02em] text-slate-950">
												M{item.price.toLocaleString()}{' '}
												<span className="text-sm font-medium text-slate-400">
													/ month
												</span>
											</p>

											<div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs">
												<p className="font-bold text-slate-800">
													{item.landlordName}
												</p>

												<p className="mt-0.5 text-slate-500">
													{item.landlordEmail}
												</p>

												<p className="mt-0.5 text-slate-500">
													{item.landlordPhone ||
														'No phone added'}
												</p>
											</div>

											{/* Latest admin comment */}
											{item.adminNote && (
												<div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs">
													<p className="font-bold text-amber-800">
														Admin comment
														{item.adminNoteAt
															? ` · ${formatDate(item.adminNoteAt)}`
															: ''}
													</p>

													<p className="mt-1 whitespace-pre-wrap text-amber-900">
														{item.adminNote}
													</p>
												</div>
											)}

											<div className="mt-3 flex items-center justify-between text-xs text-slate-400">
												<span>
													Added{' '}
													{formatDate(item.createdAt)}
												</span>
											</div>

											<div className="mt-4 grid gap-2">
												{/* Review button */}
												<button
													type="button"
													onClick={() =>
														openReview(item)
													}
													className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
												>
													<MessageSquare className="h-4 w-4" />
													Comment or mark incomplete
												</button>

												{/* View details button */}
												<Link
													href={`/admin/accommodations/${item.id}`}
													className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
												>
													<Eye className="h-4 w-4" />
													View accommodation details
												</Link>
											</div>
										</div>
									</article>
								)
							})}
						</div>
					)}
				</>
			)}

			{/* Review dialog */}
			{reviewTarget && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
					onClick={closeReview}
				>
					<div
						role="dialog"
						aria-modal="true"
						aria-labelledby="review-title"
						onClick={(event) => event.stopPropagation()}
						className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
					>
						<h2
							id="review-title"
							className="text-lg font-black tracking-[-0.02em] text-slate-950"
						>
							Review listing
						</h2>

						<p className="mt-1 text-sm text-slate-500">
							{getPropertyTypeLabel(reviewTarget.propertyType)}
							{reviewTarget.roomIdentifier
								? ` · ${reviewTarget.roomIdentifier}`
								: ''}
							{' · '}
							{reviewTarget.area}
						</p>

						<form className="mt-5 space-y-4" onSubmit={submitReview}>
							{reviewError && (
								<div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
									{reviewError}
								</div>
							)}

							<label className="grid gap-2">
								<span className="text-sm font-bold text-slate-900">
									Comment for the landlord
								</span>

								<textarea
									value={comment}
									onChange={(event) =>
										setComment(event.target.value)
									}
									rows={5}
									maxLength={1000}
									required
									disabled={reviewSaving}
									placeholder="Say what is missing, for example: add at least 3 photos and the exact room number."
									className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
								/>

								<span className="text-right text-xs text-slate-400">
									{comment.length}/1000
								</span>
							</label>

							<label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
								<input
									type="checkbox"
									checked={markIncomplete}
									onChange={(event) =>
										setMarkIncomplete(event.target.checked)
									}
									disabled={reviewSaving}
									className="mt-0.5 h-4 w-4 rounded border-slate-300"
								/>

								<span>
									<span className="font-bold text-slate-900">
										Mark as incomplete
									</span>
									<span className="mt-0.5 block text-xs text-slate-500">
										Sets the status to Inactive, so students
										no longer see this listing.
									</span>
								</span>
							</label>

							<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
								<button
									type="button"
									onClick={closeReview}
									disabled={reviewSaving}
									className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
								>
									Cancel
								</button>

								<button
									type="submit"
									disabled={reviewSaving}
									className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white transition disabled:opacity-60 ${
										markIncomplete
											? 'bg-rose-600 hover:bg-rose-700'
											: 'bg-blue-600 hover:bg-blue-700'
									}`}
								>
									{reviewSaving
										? 'Saving...'
										: markIncomplete
											? 'Mark incomplete'
											: 'Send comment'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</AdminShell>
	)
}

// useSearchParams() requires a Suspense boundary or `next build` fails.
export default function AdminAccommodationsPage() {
	return (
		<Suspense fallback={null}>
			<AdminAccommodations />
		</Suspense>
	)
}