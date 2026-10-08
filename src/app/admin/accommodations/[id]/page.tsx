'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
	ArrowLeft,
	BadgeCheck,
	CalendarDays,
	Clock,
	DollarSign,
	Home,
	ImageIcon,
	MapPin,
	Phone,
	Mail,
	User,
	Wifi,
	ShieldCheck,
	Users,
	FileText,
} from 'lucide-react'
import AdminShell from '@/components/pages/AdminShell'

type Landlord = {
	id: string
	name: string
	email: string
	phone: string | null
}

type Accommodation = {
	id: string
	roomIdentifier: string | null
	propertyType: string
	price: number
	area: string
	description: string
	availableFrom: string | null
	amenities: string[]
	latitude: number | null
	longitude: number | null
	status: string
	createdAt: string
	landlordId: string
	landlord: Landlord
	_count: {
		applications: number
	}
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
	SINGLE_ROOM: 'Single Room',
	DOUBLE: 'Double Room',
	BACHELOR: 'Bachelor',
	COMMUNE: 'Commune',
}

const STATUS_LABELS: Record<string, string> = {
	AVAILABLE: 'Available',
	VERIFIED: 'Verified',
	PENDING_REVIEW: 'Pending Review',
	OCCUPIED: 'Occupied',
	INACTIVE: 'Inactive',
}

function formatPropertyType(type: string) {
	return PROPERTY_TYPE_LABELS[type] || type.replace(/_/g, ' ')
}

function formatStatus(status: string) {
	return STATUS_LABELS[status] || status.replace(/_/g, ' ')
}

function formatPrice(price: number) {
	return `M ${Number(price).toLocaleString()}`
}

function formatDate(date: string | null) {
	if (!date) return 'Not specified'

	return new Date(date).toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})
}

function getStatusClasses(status: string) {
	switch (status) {
		case 'AVAILABLE':
			return 'bg-emerald-100 text-emerald-700'
		case 'VERIFIED':
			return 'bg-blue-100 text-blue-700'
		case 'PENDING_REVIEW':
			return 'bg-amber-100 text-amber-700'
		case 'OCCUPIED':
			return 'bg-slate-100 text-slate-700'
		case 'INACTIVE':
			return 'bg-red-100 text-red-700'
		default:
			return 'bg-slate-100 text-slate-700'
	}
}

export default function AdminAccommodationDetailsPage() {
	const params = useParams()
	const id = params.id as string

	const [accommodation, setAccommodation] =
		useState<Accommodation | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		if (!id) return

		async function fetchAccommodation() {
			try {
				setLoading(true)
				setError('')

				const response = await fetch(
					`/api/admin/accommodation/${id}`,
					{
						credentials: 'include',
					},
				)

				const data = await response.json()

				if (!response.ok) {
					throw new Error(
						data.error || 'Failed to load accommodation.',
					)
				}

				setAccommodation(data.accommodation)
			} catch (error) {
				console.error(
					'Fetch admin accommodation details error:',
					error,
				)

				setError(
					error instanceof Error
						? error.message
						: 'Something went wrong. Please try again.',
				)
			} finally {
				setLoading(false)
			}
		}

		fetchAccommodation()
	}, [id])

	if (loading) {
		return (
			<AdminShell
				active="accommodations"
				title="Accommodation Details"
				subtitle="View accommodation and landlord information."
			>
				<div className="flex min-h-[400px] items-center justify-center">
					<div className="text-center">
						<div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
						<p className="mt-4 text-sm font-medium text-slate-500">
							Loading accommodation details...
						</p>
					</div>
				</div>
			</AdminShell>
		)
	}

	if (error || !accommodation) {
		return (
			<AdminShell
				active="accommodations"
				title="Accommodation Details"
				subtitle="View accommodation and landlord information."
			>
				<div className="rounded-2xl border border-red-200 bg-red-50 p-6">
					<p className="font-bold text-red-800">
						Unable to load accommodation
					</p>

					<p className="mt-1 text-sm text-red-600">
						{error || 'Accommodation not found.'}
					</p>

					<Link
						href="/admin/accommodations"
						className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to accommodations
					</Link>
				</div>
			</AdminShell>
		)
	}

	return (
		<AdminShell
			active="accommodations"
			title="Accommodation Details"
			subtitle="View accommodation and landlord information."
		>
			<div className="space-y-6">
				{/* Back button */}
				<div>
					<Link
						href="/admin/accommodations"
						className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to accommodations
					</Link>
				</div>

				{/* Main accommodation information */}
				<div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
					<div className="border-b border-slate-200/70 p-6">
						<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
							<div>
								<div className="flex flex-wrap items-center gap-3">
									<h2 className="text-xl font-black text-slate-950">
										{accommodation.roomIdentifier ||
											'Accommodation'}
									</h2>

									<span
										className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClasses(
											accommodation.status,
										)}`}
									>
										{formatStatus(
											accommodation.status,
										)}
									</span>
								</div>

								<p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
									<MapPin className="h-4 w-4" />
									{accommodation.area}
								</p>
							</div>

							<div className="text-left sm:text-right">
								<p className="text-2xl font-black text-blue-600">
									{formatPrice(accommodation.price)}
								</p>

								<p className="text-xs font-medium text-slate-500">
									per month
								</p>
							</div>
						</div>
					</div>

					<div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
						<div className="border-b border-slate-200/70 p-5 sm:border-r">
							<div className="flex items-center gap-3">
								<div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
									<Home className="h-5 w-5" />
								</div>

								<div>
									<p className="text-xs font-semibold text-slate-400">
										Property Type
									</p>

									<p className="mt-1 text-sm font-bold text-slate-900">
										{formatPropertyType(
											accommodation.propertyType,
										)}
									</p>
								</div>
							</div>
						</div>

						<div className="border-b border-slate-200/70 p-5 lg:border-r">
							<div className="flex items-center gap-3">
								<div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
									<CalendarDays className="h-5 w-5" />
								</div>

								<div>
									<p className="text-xs font-semibold text-slate-400">
										Available From
									</p>

									<p className="mt-1 text-sm font-bold text-slate-900">
										{formatDate(
											accommodation.availableFrom,
										)}
									</p>
								</div>
							</div>
						</div>

						<div className="border-b border-slate-200/70 p-5 sm:border-r lg:border-b-0">
							<div className="flex items-center gap-3">
								<div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-600">
									<Users className="h-5 w-5" />
								</div>

								<div>
									<p className="text-xs font-semibold text-slate-400">
										Applications
									</p>

									<p className="mt-1 text-sm font-bold text-slate-900">
										{accommodation._count.applications}
									</p>
								</div>
							</div>
						</div>

						<div className="p-5">
							<div className="flex items-center gap-3">
								<div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
									<Clock className="h-5 w-5" />
								</div>

								<div>
									<p className="text-xs font-semibold text-slate-400">
										Listed On
									</p>

									<p className="mt-1 text-sm font-bold text-slate-900">
										{formatDate(
											accommodation.createdAt,
										)}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Room and description */}
				<div className="grid gap-6 lg:grid-cols-3">
					<div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm lg:col-span-2">
						<div className="flex items-center gap-3">
							<div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
								<FileText className="h-5 w-5" />
							</div>

							<div>
								<h3 className="font-black text-slate-950">
									Accommodation Information
								</h3>

								<p className="text-xs text-slate-500">
									Details provided by the landlord.
								</p>
							</div>
						</div>

						<div className="mt-6 grid gap-5 sm:grid-cols-2">
							<div>
								<p className="text-xs font-semibold text-slate-400">
									Room Identifier
								</p>

								<p className="mt-1 text-sm font-bold text-slate-900">
									{accommodation.roomIdentifier ||
										'Not specified'}
								</p>
							</div>

							<div>
								<p className="text-xs font-semibold text-slate-400">
									Property Type
								</p>

								<p className="mt-1 text-sm font-bold text-slate-900">
									{formatPropertyType(
										accommodation.propertyType,
									)}
								</p>
							</div>

							<div>
								<p className="text-xs font-semibold text-slate-400">
									Area
								</p>

								<p className="mt-1 text-sm font-bold text-slate-900">
									{accommodation.area}
								</p>
							</div>

							<div>
								<p className="text-xs font-semibold text-slate-400">
									Rent
								</p>

								<p className="mt-1 text-sm font-bold text-slate-900">
									{formatPrice(accommodation.price)}
								</p>
							</div>
						</div>

						<div className="mt-6 border-t border-slate-100 pt-6">
							<p className="text-xs font-semibold text-slate-400">
								Description
							</p>

							<p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
								{accommodation.description ||
									'No description provided.'}
							</p>
						</div>
					</div>

					{/* Location */}
					<div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600">
								<MapPin className="h-5 w-5" />
							</div>

							<div>
								<h3 className="font-black text-slate-950">
									Location
								</h3>

								<p className="text-xs text-slate-500">
									Property location information.
								</p>
							</div>
						</div>

						<div className="mt-6 space-y-4">
							<div>
								<p className="text-xs font-semibold text-slate-400">
									Area
								</p>

								<p className="mt-1 text-sm font-bold text-slate-900">
									{accommodation.area}
								</p>
							</div>

							<div>
								<p className="text-xs font-semibold text-slate-400">
									Coordinates
								</p>

								{accommodation.latitude !== null &&
								accommodation.longitude !== null ? (
									<div className="mt-1 space-y-1 text-sm text-slate-600">
										<p>
											Latitude:{' '}
											<span className="font-semibold text-slate-900">
												{
													accommodation.latitude
												}
											</span>
										</p>

										<p>
											Longitude:{' '}
											<span className="font-semibold text-slate-900">
												{
													accommodation.longitude
												}
											</span>
										</p>
									</div>
								) : (
									<p className="mt-1 text-sm text-slate-500">
										Location coordinates not available.
									</p>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Amenities */}
				<div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
					<div className="flex items-center gap-3">
						<div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-50 text-cyan-600">
							<Wifi className="h-5 w-5" />
						</div>

						<div>
							<h3 className="font-black text-slate-950">
								Amenities
							</h3>

							<p className="text-xs text-slate-500">
								Facilities and features provided with the
								accommodation.
							</p>
						</div>
					</div>

					{accommodation.amenities &&
					accommodation.amenities.length > 0 ? (
						<div className="mt-5 flex flex-wrap gap-2">
							{accommodation.amenities.map(
								(amenity, index) => (
									<div
										key={`${amenity}-${index}`}
										className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
									>
										<ShieldCheck className="h-4 w-4 text-blue-600" />
										{amenity}
									</div>
								),
							)}
						</div>
					) : (
						<p className="mt-5 text-sm text-slate-500">
							No amenities have been specified.
						</p>
					)}
				</div>

				{/* Landlord information */}
				<div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
					<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
						<div className="flex items-center gap-3">
							<div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-600">
								<User className="h-5 w-5" />
							</div>

							<div>
								<h3 className="font-black text-slate-950">
									Landlord Information
								</h3>

								<p className="text-xs text-slate-500">
									Owner of this accommodation listing.
								</p>
							</div>
						</div>

						<Link
							href={`/admin/accommodations?landlord=${accommodation.landlord.id}`}
							className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
						>
							View landlord listings
						</Link>
					</div>

					<div className="mt-6 grid gap-5 sm:grid-cols-3">
						<div className="rounded-xl bg-slate-50 p-4">
							<div className="flex items-center gap-2 text-slate-400">
								<User className="h-4 w-4" />
								<p className="text-xs font-semibold">
									Name
								</p>
							</div>

							<p className="mt-2 text-sm font-bold text-slate-900">
								{accommodation.landlord.name}
							</p>
						</div>

						<div className="rounded-xl bg-slate-50 p-4">
							<div className="flex items-center gap-2 text-slate-400">
								<Mail className="h-4 w-4" />
								<p className="text-xs font-semibold">
									Email
								</p>
							</div>

							<p className="mt-2 break-all text-sm font-bold text-slate-900">
								{accommodation.landlord.email}
							</p>
						</div>

						<div className="rounded-xl bg-slate-50 p-4">
							<div className="flex items-center gap-2 text-slate-400">
								<Phone className="h-4 w-4" />
								<p className="text-xs font-semibold">
									Phone
								</p>
							</div>

							<p className="mt-2 text-sm font-bold text-slate-900">
								{accommodation.landlord.phone ||
									'Not provided'}
							</p>
						</div>
					</div>
				</div>

				{/* Summary */}
				<div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
					<div className="flex gap-3">
						<BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

						<div>
							<p className="text-sm font-bold text-blue-900">
								Accommodation record
							</p>

							<p className="mt-1 text-sm leading-6 text-blue-800">
								This page provides the administrator with
								the accommodation details, location,
								amenities, landlord information, and
								application count associated with this
								listing.
							</p>
						</div>
					</div>
				</div>
			</div>
		</AdminShell>
	)
}