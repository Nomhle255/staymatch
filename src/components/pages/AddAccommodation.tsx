'use client'

import { useRouter } from 'next/navigation'
import {
	useEffect,
	useRef,
	useState,
	type ReactNode,
	type ComponentType,
	type ChangeEvent,
	type FormEvent,
} from 'react'
import Link from 'next/link'
import {
	LayoutDashboard,
	Home,
	PlusCircle,
	Users,
	LogOut,
	FileText,
	ChevronDown,
	Wifi,
	Sofa,
	Car,
	ShieldCheck,
	Droplets,
	Zap,
	UploadCloud,
	X,
	Crosshair,
	Search,
	CheckCircle2,
	MapPin,
	PanelTop,
	LayoutGrid,
	Blinds,
	DoorClosed,
	LockKeyhole,
	Fence,
} from 'lucide-react'
import type * as Leaflet from 'leaflet'

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
		active: false,
		href: '/landlord/accommodationlisting',
	},
	{
		label: 'Add Listing',
		icon: PlusCircle,
		active: true,
		href: '/landlord/addaccommodation',
	},
	{
		label: 'Applications',
		icon: Users,
		active: false,
		href: '/landlord/applications',
	},
]

const propertyTypes = [
	{ label: 'Single Room', value: 'SINGLE_ROOM' },
	{ label: 'Double', value: 'DOUBLE' },
	{ label: 'Commune', value: 'COMMUNE' },
	{ label: 'Bachelor', value: 'BACHELOR' },
]

const amenitiesList = [
	{ label: 'Water included', icon: Droplets },
	{ label: 'Electricity included', icon: Zap },
	{ label: 'Ceiling', icon: PanelTop },
	{ label: 'Tile', icon: LayoutGrid },
	{ label: 'Buglars on windows', icon: Blinds },
	{ label: 'buglars on doors', icon: DoorClosed },
	{ label: 'Buglars on doors and windows', icon: LockKeyhole },
	{ label: 'Fenced', icon: Fence },
	{ label: 'Wi-Fi', icon: Wifi },
	{ label: 'Furnished', icon: Sofa },
	{ label: 'Parking available', icon: Car },
	{ label: '24/7 security', icon: ShieldCheck },
]
const inputClasses =
	'w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100'

type FieldProps = {
	label: string
	children: ReactNode
}

function Field({ label, children }: FieldProps) {
	return (
		<label className="grid gap-2">
			<span className="text-sm font-bold text-slate-900">
				{label}
			</span>

			{children}
		</label>
	)
}

type InputShellProps = {
	icon: ComponentType<{ className?: string }>
	children: ReactNode
}

function InputShell({
	icon: Icon,
	children,
}: InputShellProps) {
	return (
		<div className="relative">
			<Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
			{children}
		</div>
	)
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

function AddAccommodation() {
	const router = useRouter()

	const [propertyType, setPropertyType] = useState('')
	const [price, setPrice] = useState('')
	const [area, setArea] = useState('')
	const [description, setDescription] = useState('')
	const [availableFrom, setAvailableFrom] = useState('')

	const [selectedAmenities, setSelectedAmenities] =
		useState<string[]>([])
	const [photos, setPhotos] = useState<string[]>([])

	// Property location
	const [latitude, setLatitude] =
		useState<number | null>(null)
	const [longitude, setLongitude] =
		useState<number | null>(null)
	const [locationConfirmed, setLocationConfirmed] =
		useState(false)
	const [locationLoading, setLocationLoading] =
		useState(false)
	const [locationError, setLocationError] = useState('')
	const [searchLocation, setSearchLocation] =
		useState('')

	const mapRef = useRef<HTMLDivElement | null>(null)
	const mapInstanceRef =
		useRef<Leaflet.Map | null>(null)
	const markerRef =
		useRef<Leaflet.Marker | null>(null)

	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState('')
	const [error, setError] = useState('')

	/*
	 * Initialise Leaflet map.
	 */
	useEffect(() => {
		if (!mapRef.current || mapInstanceRef.current)
			return

		let cancelled = false

		const initializeMap = async () => {
			const leafletModule = await import('leaflet')

			if (cancelled || !mapRef.current)
				return

			const L = leafletModule.default

			// Default location: Maseru
			const defaultLatitude = -29.3151
			const defaultLongitude = 27.4869

			const map = L.map(mapRef.current, {
				dragging: true,
				scrollWheelZoom: true,
				doubleClickZoom: true,
				boxZoom: true,
				keyboard: true,
			}).setView(
				[defaultLatitude, defaultLongitude],
				12,
			)

			map.dragging.enable()

			L.tileLayer(
				'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
				{
					attribution:
						'&copy; OpenStreetMap contributors',
				},
			).addTo(map)

			map.on(
				'click',
				(event: Leaflet.LeafletMouseEvent) => {
					const { lat, lng } = event.latlng

					setLatitude(lat)
					setLongitude(lng)
					setLocationConfirmed(false)

					if (markerRef.current) {
						markerRef.current.setLatLng([
							lat,
							lng,
						])
					} else {
						const marker = L.marker(
							[lat, lng],
							{
								draggable: true,
							},
						).addTo(map)

						marker.on(
							'dragend',
							() => {
								const position =
									marker.getLatLng()

								setLatitude(
									position.lat,
								)
								setLongitude(
									position.lng,
								)
								setLocationConfirmed(
									false,
								)
							},
						)

						markerRef.current = marker
					}
				},
			)

			mapInstanceRef.current = map
		}

		initializeMap()

		return () => {
			cancelled = true

			if (mapInstanceRef.current) {
				mapInstanceRef.current.remove()
				mapInstanceRef.current = null
			}

			markerRef.current = null
		}
	}, [])

	/*
	 * Set marker on map.
	 */
	const setMapLocation = (
		lat: number,
		lng: number,
		zoom = 16,
	) => {
		setLatitude(lat)
		setLongitude(lng)
		setLocationConfirmed(false)

		const map = mapInstanceRef.current

		if (!map) return

		map.setView([lat, lng], zoom)

		if (markerRef.current) {
			markerRef.current.setLatLng([lat, lng])
			return
		}

		const createMarker = async () => {
			const leafletModule = await import('leaflet')
			const L = leafletModule.default

			if (!mapInstanceRef.current) return

			const marker = L.marker([lat, lng], {
				draggable: true,
			}).addTo(mapInstanceRef.current)

			marker.on('dragend', () => {
				const position = marker.getLatLng()

				setLatitude(position.lat)
				setLongitude(position.lng)
				setLocationConfirmed(false)
			})

			markerRef.current = marker
		}

		createMarker()
	}

	/*
	 * Use landlord's current GPS location.
	 */
	const getCurrentLocation = () => {
		setLocationLoading(true)
		setLocationError('')
		setLocationConfirmed(false)

		if (!navigator.geolocation) {
			setLocationError(
				'Geolocation is not supported by this browser.',
			)
			setLocationLoading(false)
			return
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const lat = position.coords.latitude
				const lng = position.coords.longitude

				setMapLocation(lat, lng, 17)

				setLocationLoading(false)
			},
			(error) => {
				console.error(error)

				setLocationError(
					'Unable to get your location. Please allow location access and try again.',
				)

				setLocationLoading(false)
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 0,
			},
		)
	}

	/*
	 * Search for an address/place using OpenStreetMap Nominatim.
	 */
	const searchPropertyLocation = async () => {
		if (!searchLocation.trim()) return

		setLocationLoading(true)
		setLocationError('')
		setLocationConfirmed(false)

		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
					searchLocation,
				)}`,
			)

			if (!response.ok) {
				throw new Error(
					'Location search failed.',
				)
			}

			const results = await response.json()

			if (!results.length) {
				setLocationError(
					'Location not found. Try a more specific address or area.',
				)
				return
			}

			const result = results[0]

			const lat = Number(result.lat)
			const lng = Number(result.lon)

			setMapLocation(lat, lng, 17)
		} catch (error) {
			console.error(error)

			setLocationError(
				'Unable to search for this location. Please try again.',
			)
		} finally {
			setLocationLoading(false)
		}
	}

	const confirmLocation = () => {
		if (
			latitude === null ||
			longitude === null
		) {
			setLocationError(
				'Please select a location on the map first.',
			)
			return
		}

		setLocationConfirmed(true)
		setLocationError('')
	}

	const toggleAmenity = (label: string) => {
		setSelectedAmenities((current) =>
			current.includes(label)
				? current.filter(
						(item) => item !== label,
					)
				: [...current, label],
		)
	}

	const handlePhotoSelect = (
		event: ChangeEvent<HTMLInputElement>,
	) => {
		const files = event.target.files

		if (!files) return

		const names = Array.from(files).map(
			(file) => file.name,
		)

		setPhotos((current) => [
			...current,
			...names,
		])
	}

	const removePhoto = (index: number) => {
		setPhotos((current) =>
			current.filter(
				(_, i) => i !== index,
			),
		)
	}

	const handleSubmit = async (
		event: FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault()

		if (
			!propertyType ||
			!price ||
			!area ||
			!description
		) {
			setError(
				'Please complete all required accommodation details.',
			)
			return
		}

		if (
			latitude === null ||
			longitude === null ||
			!locationConfirmed
		) {
			setError(
				'Please select and confirm the property location before publishing.',
			)
			return
		}

		setLoading(true)
		setMessage('')
		setError('')

		try {
			const response = await fetch(
				'/api/addaccommodation',
				{
					method: 'POST',
					headers: {
						'Content-Type':
							'application/json',
					},
					body: JSON.stringify({
						propertyType,
						price: Number(price),
						area,
						description,
						availableFrom:
							availableFrom ||
							null,
						amenities:
							selectedAmenities,
						photos,
						latitude,
						longitude,
					}),
				},
			)

			const data = await response.json()

			if (!response.ok) {
				throw new Error(
					data.error ||
						'Failed to add accommodation.',
				)
			}

			// Show success message
			setMessage(
				'Accommodation added successfully!',
			)

			// Redirect after the message
			// has been displayed for 2 seconds
			setTimeout(() => {
				router.push(
					'/landlord/accommodationlisting',
				)
			}, 2000)
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: 'Something went wrong.',
			)
		} finally {
			setLoading(false)
		}
	}

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
				<div>
					<h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">
						Add a New Listing
					</h1>

					<p className="mt-1 text-sm text-slate-500">
						Fill in the details below to
						publish a listing for students
						to find.
					</p>
				</div>

				{/* Success message */}
				{message && (
					<div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
						{message}
					</div>
				)}

				{/* Error message */}
				{error && (
					<div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
						{error}
					</div>
				)}

				<form
					onSubmit={handleSubmit}
					className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]"
				>
					<div className="space-y-6">
						{/* BASIC INFORMATION */}
						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<h2 className="text-lg font-extrabold text-slate-950">
								Basic information
							</h2>

							<div className="mt-5 space-y-5">
								<div className="grid gap-5 sm:grid-cols-2">
									{/* Property Type */}
									<Field label="Property type">
										<div className="relative">
											<select
												value={
													propertyType
												}
												onChange={(
													event,
												) =>
													setPropertyType(
														event
															.target
															.value,
													)
												}
												required
												className={`${inputClasses} appearance-none pl-4`}
											>
												<option
													value=""
													disabled
												>
													Select type
												</option>

												{propertyTypes.map(
													(
														type,
													) => (
														<option
															key={
																type.value
															}
															value={
																type.value
															}
														>
															{
																type.label
															}
														</option>
													),
												)}
											</select>

											<ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
										</div>
									</Field>

									{/* Monthly Rent */}
									<Field label="Monthly rent (M)">
										<input
											type="number"
											value={price}
											onChange={(
												event,
											) =>
												setPrice(
													event
														.target
														.value,
												)
											}
											placeholder="2800"
											required
											min="0"
											className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
										/>
									</Field>
								</div>

								{/* AREA */}
								<Field label="Area">
									<InputShell icon={MapPin}>
										<input
											type="text"
											value={area}
											onChange={(
												event,
											) =>
												setArea(
													event
														.target
														.value,
												)
											}
											placeholder="e.g. Ha Abia, Masowe, Qoaling"
											required
											className={inputClasses}
										/>
									</InputShell>

									<p className="text-xs text-slate-400">
										Enter the specific
										area where the
										accommodation is
										located.
									</p>
								</Field>

								{/* Description */}
								<Field label="Description">
									<div className="relative">
										<FileText className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />

										<textarea
											rows={4}
											value={
												description
											}
											onChange={(
												event,
											) =>
												setDescription(
													event
														.target
														.value,
												)
											}
											placeholder="Describe the property, what's nearby, and what makes it a good fit for students..."
											required
											className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
										/>
									</div>
								</Field>

								{/* Facilities */}
								<Field label="Property facilities">
									<div className="mt-5 grid gap-3 sm:grid-cols-2">
										{amenitiesList.map(
											(
												amenity,
											) => {
												const isSelected =
													selectedAmenities.includes(
														amenity.label,
													)

												const Icon =
													amenity.icon

												return (
													<button
														type="button"
														key={
															amenity.label
														}
														onClick={() =>
															toggleAmenity(
																amenity.label,
															)
														}
														className={`flex items-center gap-3 rounded-xl border p-3.5 text-left text-sm font-semibold transition ${
															isSelected
																? 'border-blue-400 bg-blue-50 text-blue-700'
																: 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
														}`}
													>
														<Icon className="h-4 w-4 shrink-0" />

														{
															amenity.label
														}
													</button>
												)
											},
										)}
									</div>
								</Field>
							</div>
						</section>

						{/* PROPERTY LOCATION */}
						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<div className="flex items-start justify-between gap-4">
								<div>
									<h2 className="text-lg font-extrabold text-slate-950">
										Property location
									</h2>

									<p className="mt-1 text-sm leading-6 text-slate-500">
										Select the exact
										location of the
										accommodation so
										students can find
										it and distance
										from their
										university can be
										calculated.
									</p>
								</div>
							</div>

							{/* Current Location */}
							<div className="mt-5">
								<button
									type="button"
									onClick={
										getCurrentLocation
									}
									disabled={
										locationLoading
									}
									className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
								>
									<Crosshair className="h-4 w-4" />

									{locationLoading
										? 'Getting location...'
										: 'Use My Current Location'}
								</button>
							</div>

							<div className="my-5 flex items-center gap-3">
								<div className="h-px flex-1 bg-slate-200" />

								<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
									or select on map
								</span>

								<div className="h-px flex-1 bg-slate-200" />
							</div>

							{/* Search Location */}
							<div className="flex gap-2">
								<div className="relative flex-1">
									<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

									<input
										type="text"
										value={
											searchLocation
										}
										onChange={(
											event,
										) =>
											setSearchLocation(
												event
													.target
													.value,
											)
										}
										onKeyDown={(
											event,
										) => {
											if (
												event.key ===
												'Enter'
											) {
												event.preventDefault()
												searchPropertyLocation()
											}
										}}
										placeholder="Search for an address or area..."
										className={`${inputClasses} pl-11`}
									/>
								</div>

								<button
									type="button"
									onClick={
										searchPropertyLocation
									}
									disabled={
										locationLoading ||
										!searchLocation.trim()
									}
									className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
								>
									Search
								</button>
							</div>

							{/* Map */}
							<div
								ref={mapRef}
								className="mt-4 h-[350px] w-full overflow-hidden rounded-2xl border border-slate-200"
							/>

							<p className="mt-3 text-xs text-slate-400">
								Click anywhere on the map
								to select the property.
								You can drag the map in
								any direction and drag
								the marker to adjust the
								exact location.
							</p>

							{/* Coordinates */}
							{latitude !== null &&
								longitude !== null && (
									<div className="mt-4 rounded-xl bg-slate-50 p-4">
										<div className="flex items-center justify-between gap-3">
											<div>
												<p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
													Selected
													location
												</p>

												<p className="mt-1 text-sm font-semibold text-slate-700">
													Latitude:{' '}
													{latitude.toFixed(
														6,
													)}
												</p>

												<p className="text-sm font-semibold text-slate-700">
													Longitude:{' '}
													{longitude.toFixed(
														6,
													)}
												</p>
											</div>

											{locationConfirmed && (
												<CheckCircle2 className="h-6 w-6 shrink-0 text-green-600" />
											)}
										</div>
									</div>
								)}

							{/* Location Error */}
							{locationError && (
								<div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
									{locationError}
								</div>
							)}

							{/* Confirm Location */}
							<button
								type="button"
								onClick={
									confirmLocation
								}
								disabled={
									latitude ===
										null ||
									longitude ===
										null
								}
								className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition ${
									locationConfirmed
										? 'bg-green-600 text-white'
										: 'bg-blue-600 text-white hover:bg-blue-700'
								} disabled:cursor-not-allowed disabled:opacity-50`}
							>
								<CheckCircle2 className="h-4 w-4" />

								{locationConfirmed
									? 'Location Confirmed'
									: 'Confirm Location'}
							</button>
						</section>
					</div>

					{/* RIGHT COLUMN */}
					<div className="space-y-6">
						{/* PHOTOS */}
						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<h2 className="text-lg font-extrabold text-slate-950">
								Photos
							</h2>

							<p className="mt-1 text-sm text-slate-500">
								Add clear photos of
								the room, common
								areas, and exterior.
							</p>

							<label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center transition hover:border-blue-300 hover:bg-blue-50/40">
								<UploadCloud className="h-6 w-6 text-slate-400" />

								<p className="text-sm font-semibold text-slate-600">
									Click to upload
									photos
								</p>

								<p className="text-xs text-slate-400">
									PNG or JPG, up to
									5MB each
								</p>

								<input
									type="file"
									accept="image/*"
									multiple
									className="hidden"
									onChange={
										handlePhotoSelect
									}
								/>
							</label>

							{photos.length > 0 && (
								<ul className="mt-4 space-y-2">
									{photos.map(
										(
											name,
											index,
										) => (
											<li
												key={`${name}-${index}`}
												className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600"
											>
												<span className="truncate">
													{
														name
													}
												</span>

												<button
													type="button"
													onClick={() =>
														removePhoto(
															index,
														)
													}
													className="text-slate-400 transition hover:text-rose-500"
												>
													<X className="h-4 w-4" />
												</button>
											</li>
										),
									)}
								</ul>
							)}
						</section>

						{/* PUBLISH */}
						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<h2 className="text-lg font-extrabold text-slate-950">
								Publish
							</h2>

							<p className="mt-1 text-sm leading-6 text-slate-500">
								New listings are
								reviewed before
								appearing as
								"Verified" to
								students.
							</p>

							<div className="mt-5">
								<button
									type="submit"
									disabled={loading}
									className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{loading
										? 'Submitting...'
										: 'Publish Listing'}
								</button>
							</div>
						</section>
					</div>
				</form>
			</main>
		</div>
	)
}

export default AddAccommodation
