'use client'

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
import { useRouter, useSearchParams } from 'next/navigation'
import {
	LayoutDashboard,
	Home,
	PlusCircle,
	Users,
	LogOut,
	MapPin,
	FileText,
	ChevronDown,
	CalendarClock,
	Wifi,
	Sofa,
	Car,
	ShieldCheck,
	Droplets,
	Zap,
	WashingMachine,
	UploadCloud,
	X,
	Crosshair,
	Search,
	CheckCircle2,
	ArrowLeft,
} from 'lucide-react'
import type * as Leaflet from 'leaflet'

const navItems = [
	{ label: 'Dashboard', icon: LayoutDashboard, active: false, href: '/landlord/dashboard' },
	{ label: 'My Listings', icon: Home, active: true, href: '/landlord/accommodationlisting' },
	{ label: 'Add Listing', icon: PlusCircle, active: false, href: '/landlord/addaccommodation' },
	{ label: 'Applications', icon: Users, active: false, href: '/landlord/applications' },
]

const propertyTypes = [
	{ label: 'Single Room', value: 'SINGLE_ROOM' },
	{ label: 'Double', value: 'DOUBLE' },
	{ label: 'Commune', value: 'COMMUNE' },
	{ label: 'Bachelor', value: 'BACHELOR' },
]

const amenitiesList = [
	{ label: 'Wi-Fi included', icon: Wifi },
	{ label: 'Furnished', icon: Sofa },
	{ label: 'Parking available', icon: Car },
	{ label: '24/7 security', icon: ShieldCheck },
	{ label: 'Water included', icon: Droplets },
	{ label: 'Electricity included', icon: Zap },
	{ label: 'Laundry facilities', icon: WashingMachine },
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
			<span className="text-sm font-bold text-slate-900">{label}</span>
			{children}
		</label>
	)
}

type InputShellProps = {
	icon: ComponentType<{ className?: string }>
	children: ReactNode
}

function InputShell({ icon: Icon, children }: InputShellProps) {
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

function SidebarShell({ children }: { children: ReactNode }) {
	return (
		<aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-200/70 bg-white px-4 py-6 lg:flex">
			{children}
		</aside>
	)
}

function EditAccommodation() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const accommodationId = searchParams.get('id')

	const [propertyType, setPropertyType] = useState('')
	const [price, setPrice] = useState('')
	const [description, setDescription] = useState('')

	const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
	const [photos, setPhotos] = useState<string[]>([])

	const [latitude, setLatitude] = useState<number | null>(null)
	const [longitude, setLongitude] = useState<number | null>(null)
	const [area, setArea] = useState('')
	const [locationConfirmed, setLocationConfirmed] = useState(false)
	const [locationLoading, setLocationLoading] = useState(false)
	const [locationError, setLocationError] = useState('')
	const [searchLocation, setSearchLocation] = useState('')

	const mapRef = useRef<HTMLDivElement | null>(null)
	const mapInstanceRef = useRef<Leaflet.Map | null>(null)
	const markerRef = useRef<Leaflet.Marker | null>(null)
	const mapReadyRef = useRef(false)

	const [initialLoading, setInitialLoading] = useState(true)
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState('')
	const [error, setError] = useState('')

	/*
	 * Fetch the existing accommodation and pre-fill the form.
	 */
	useEffect(() => {
		const fetchAccommodation = async () => {
			if (!accommodationId) {
				setError('Accommodation ID is missing.')
				setInitialLoading(false)
				return
			}

			try {
				const response = await fetch(`/api/accommodationlistings/${accommodationId}`)
				const data = await response.json()

				if (!response.ok) {
					throw new Error(data.error || 'Failed to load accommodation.')
				}

				const accommodation = data.accommodation

				setPropertyType(accommodation.propertyType ?? '')
				setPrice(String(accommodation.price ?? ''))
				setDescription(accommodation.description ?? '')
				setSelectedAmenities(Array.isArray(accommodation.amenities) ? accommodation.amenities : [])
				setPhotos(Array.isArray(accommodation.photos) ? accommodation.photos : [])
				setArea(accommodation.area ?? '')
				setLatitude(accommodation.latitude ?? null)
				setLongitude(accommodation.longitude ?? null)
				setLocationConfirmed(true)
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to load accommodation.')
			} finally {
				setInitialLoading(false)
			}
		}

		fetchAccommodation()
	}, [accommodationId])

	/*
	 * Initialise Leaflet map once the existing location has loaded.
	 */
	useEffect(() => {
		if (initialLoading || !mapRef.current || mapInstanceRef.current) return

		let cancelled = false

		const initializeMap = async () => {
			const leafletModule = await import('leaflet')

			if (cancelled || !mapRef.current) return

			const L = leafletModule.default

			const startLat = latitude ?? -29.3151
			const startLng = longitude ?? 27.4869

			const map = L.map(mapRef.current, {
				dragging: true,
				scrollWheelZoom: true,
				doubleClickZoom: true,
				boxZoom: true,
				keyboard: true,
			}).setView([startLat, startLng], latitude ? 16 : 12)

			map.dragging.enable()

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; OpenStreetMap contributors',
			}).addTo(map)

			if (latitude !== null && longitude !== null) {
				const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map)

				marker.on('dragend', () => {
					const position = marker.getLatLng()
					setLatitude(position.lat)
					setLongitude(position.lng)
					setArea('')
					setLocationConfirmed(false)
				})

				markerRef.current = marker
			}

			map.on('click', (event: Leaflet.LeafletMouseEvent) => {
				const { lat, lng } = event.latlng

				setLatitude(lat)
				setLongitude(lng)
				setArea('')
				setLocationConfirmed(false)

				if (markerRef.current) {
					markerRef.current.setLatLng([lat, lng])
				} else {
					const marker = L.marker([lat, lng], { draggable: true }).addTo(map)

					marker.on('dragend', () => {
						const position = marker.getLatLng()
						setLatitude(position.lat)
						setLongitude(position.lng)
						setArea('')
						setLocationConfirmed(false)
					})

					markerRef.current = marker
				}
			})

			mapInstanceRef.current = map
			mapReadyRef.current = true
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
	}, [initialLoading, latitude, longitude])

	const setMapLocation = (lat: number, lng: number, zoom = 16) => {
		setLatitude(lat)
		setLongitude(lng)
		setArea('')
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

			const marker = L.marker([lat, lng], { draggable: true }).addTo(mapInstanceRef.current)

			marker.on('dragend', () => {
				const position = marker.getLatLng()
				setLatitude(position.lat)
				setLongitude(position.lng)
				setArea('')
				setLocationConfirmed(false)
			})

			markerRef.current = marker
		}

		createMarker()
	}

	const getCurrentLocation = () => {
		setLocationLoading(true)
		setLocationError('')
		setLocationConfirmed(false)

		if (!navigator.geolocation) {
			setLocationError('Geolocation is not supported by this browser.')
			setLocationLoading(false)
			return
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				setMapLocation(position.coords.latitude, position.coords.longitude, 17)
				setLocationLoading(false)
			},
			(err) => {
				console.error(err)
				setLocationError('Unable to get your location. Please allow location access and try again.')
				setLocationLoading(false)
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
		)
	}

	const searchPropertyLocation = async () => {
		if (!searchLocation.trim()) return

		setLocationLoading(true)
		setLocationError('')
		setLocationConfirmed(false)

		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(searchLocation)}`,
			)

			if (!response.ok) throw new Error('Location search failed.')

			const results = await response.json()

			if (!results.length) {
				setLocationError('Location not found. Try a more specific address or area.')
				return
			}

			setMapLocation(Number(results[0].lat), Number(results[0].lon), 17)
		} catch (err) {
			console.error(err)
			setLocationError('Unable to search for this location. Please try again.')
		} finally {
			setLocationLoading(false)
		}
	}

	const reverseGeocodeArea = async (lat: number, lng: number) => {
		const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)

		if (!response.ok) throw new Error('Reverse geocoding failed.')

		const result = await response.json()
		const address = result.address ?? {}

		const neighbourhood =
			address.suburb || address.neighbourhood || address.village || address.town || address.city_district
		const town = address.city || address.town || address.county

		const label = [neighbourhood, town].filter(Boolean).join(', ')

		if (!label) throw new Error('Could not determine an area name for this location.')

		return label
	}

	const confirmLocation = async () => {
		if (latitude === null || longitude === null) {
			setLocationError('Please select a location on the map first.')
			return
		}

		setLocationLoading(true)
		setLocationError('')

		try {
			const resolvedArea = await reverseGeocodeArea(latitude, longitude)
			setArea(resolvedArea)
			setLocationConfirmed(true)
		} catch (err) {
			console.error(err)
			setLocationError('Could not determine the area for this location. Please try a different spot on the map.')
			setLocationConfirmed(false)
		} finally {
			setLocationLoading(false)
		}
	}

	const toggleAmenity = (label: string) => {
		setSelectedAmenities((current) =>
			current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
		)
	}

	const handlePhotoSelect = (event: ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files
		if (!files) return
		const names = Array.from(files).map((file) => file.name)
		setPhotos((current) => [...current, ...names])
	}

	const removePhoto = (index: number) => {
		setPhotos((current) => current.filter((_, i) => i !== index))
	}

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (latitude === null || longitude === null || !locationConfirmed || !area) {
			setError('Please select and confirm the property location before saving.')
			return
		}

		setLoading(true)
		setMessage('')
		setError('')

		try {
			const response = await fetch(`/api/accommodationlistings/${accommodationId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					propertyType,
					price: Number(price),
					area,
					description,
					amenities: selectedAmenities,
					photos,
					latitude,
					longitude,
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to save changes.')
			}

			setMessage('Changes saved successfully. Redirecting...')

			setTimeout(() => {
				router.push(`/landlord/accommodationdetails?id=${accommodationId}`)
			}, 1000)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Something went wrong.')
		} finally {
			setLoading(false)
		}
	}

	if (initialLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-50">
				<p className="text-sm text-slate-500">Loading listing...</p>
			</div>
		)
	}

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
							<div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">K</div>
							<div>
								<p className="text-sm font-bold text-slate-900">Khaya Cathala</p>
								<p className="text-xs text-slate-500">Landlord</p>
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
					href={`/landlord/accommodationdetails?id=${accommodationId}`}
					className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Details
				</Link>

				<div>
					<h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">Edit Listing</h1>
					<p className="mt-1 text-sm text-slate-500">Update the details below and save your changes.</p>
				</div>

				{message && (
					<div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
						{message}
					</div>
				)}

				{error && (
					<div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
					<div className="space-y-6">
						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<h2 className="text-lg font-extrabold text-slate-950">Basic information</h2>

							<div className="mt-5 space-y-5">

								<div className="grid gap-5 sm:grid-cols-2">
									<Field label="Property type">
										<div className="relative">
											<select
												value={propertyType}
												onChange={(event) => setPropertyType(event.target.value)}
												required
												className={`${inputClasses} appearance-none pl-4`}
											>
												<option value="" disabled>
													Select type
												</option>
												{propertyTypes.map((type) => (
													<option key={type.value} value={type.value}>
														{type.label}
													</option>
												))}
											</select>
											<ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
										</div>
									</Field>

									<Field label="Monthly rent (M)">
										<input
											type="number"
											value={price}
											onChange={(event) => setPrice(event.target.value)}
											required
											min="0"
											className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
										/>
									</Field>
                                    <Field label="Area ">
                                        <div className="relative">
										<FileText className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />
										<textarea
											rows={1}
											value={area}
											onChange={(event) => setArea(event.target.value)}
											required
											className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
										/>
                                        </div>
									</Field>
								</div>

								<Field label="Description">
									<div className="relative">
										<FileText className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />
										<textarea
											rows={4}
											value={description}
											onChange={(event) => setDescription(event.target.value)}
											required
											className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
										/>
									</div>
								</Field>
							</div>
						</section>

						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<div className="flex items-start justify-between gap-4">
								<div>
									<h2 className="text-lg font-extrabold text-slate-950">Property location</h2>
									<p className="mt-1 text-sm leading-6 text-slate-500">
										Move the pin if the location needs updating. The area name updates automatically.
									</p>
								</div>
								<MapPin className="hidden h-5 w-5 shrink-0 text-blue-600 sm:block" />
							</div>

							<div className="mt-5">
								<button
									type="button"
									onClick={getCurrentLocation}
									disabled={locationLoading}
									className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
								>
									<Crosshair className="h-4 w-4" />
									{locationLoading ? 'Getting location...' : 'Use My Current Location'}
								</button>
							</div>

							<div className="my-5 flex items-center gap-3">
								<div className="h-px flex-1 bg-slate-200" />
								<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">or select on map</span>
								<div className="h-px flex-1 bg-slate-200" />
							</div>

							<div className="flex gap-2">
								<div className="relative flex-1">
									<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
									<input
										type="text"
										value={searchLocation}
										onChange={(event) => setSearchLocation(event.target.value)}
										onKeyDown={(event) => {
											if (event.key === 'Enter') {
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
									onClick={searchPropertyLocation}
									disabled={locationLoading || !searchLocation.trim()}
									className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
								>
									Search
								</button>
							</div>

							<div ref={mapRef} className="mt-4 h-[350px] w-full overflow-hidden rounded-2xl border border-slate-200" />

							<p className="mt-3 text-xs text-slate-400">
								Click anywhere on the map to move the pin, or drag the marker to adjust it.
							</p>

							{latitude !== null && longitude !== null && (
								<div className="mt-4 rounded-xl bg-slate-50 p-4">
									<div className="flex items-center justify-between gap-3">
										<div>
											<p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Selected location</p>
											<p className="mt-1 text-sm font-semibold text-slate-700">Latitude: {latitude.toFixed(6)}</p>
											<p className="text-sm font-semibold text-slate-700">Longitude: {longitude.toFixed(6)}</p>
											{area && <p className="mt-2 text-sm font-semibold text-blue-600">Area: {area}</p>}
										</div>
										{locationConfirmed && <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600" />}
									</div>
								</div>
							)}

							{locationError && (
								<div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
									{locationError}
								</div>
							)}

							<button
								type="button"
								onClick={confirmLocation}
								disabled={latitude === null || longitude === null || locationLoading}
								className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition ${
									locationConfirmed ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
								} disabled:cursor-not-allowed disabled:opacity-50`}
							>
								<CheckCircle2 className="h-4 w-4" />
								{locationLoading ? 'Finding area...' : locationConfirmed ? 'Location Confirmed' : 'Confirm Location'}
							</button>
						</section>

						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<h2 className="text-lg font-extrabold text-slate-950">Amenities</h2>

							<div className="mt-5 grid gap-3 sm:grid-cols-2">
								{amenitiesList.map((amenity) => {
									const isSelected = selectedAmenities.includes(amenity.label)
									const Icon = amenity.icon
									return (
										<button
											type="button"
											key={amenity.label}
											onClick={() => toggleAmenity(amenity.label)}
											className={`flex items-center gap-3 rounded-xl border p-3.5 text-left text-sm font-semibold transition ${
												isSelected
													? 'border-blue-400 bg-blue-50 text-blue-700'
													: 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
											}`}
										>
											<Icon className="h-4 w-4 shrink-0" />
											{amenity.label}
										</button>
									)
								})}
							</div>
						</section>
					</div>

					<div className="space-y-6">
						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<h2 className="text-lg font-extrabold text-slate-950">Photos</h2>
							<p className="mt-1 text-sm text-slate-500">Add or remove photos of the room, common areas, and exterior.</p>

							<label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center transition hover:border-blue-300 hover:bg-blue-50/40">
								<UploadCloud className="h-6 w-6 text-slate-400" />
								<p className="text-sm font-semibold text-slate-600">Click to upload photos</p>
								<p className="text-xs text-slate-400">PNG or JPG, up to 5MB each</p>
								<input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
							</label>

							{photos.length > 0 && (
								<ul className="mt-4 space-y-2">
									{photos.map((name, index) => (
										<li
											key={`${name}-${index}`}
											className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600"
										>
											<span className="truncate">{name}</span>
											<button
												type="button"
												onClick={() => removePhoto(index)}
												className="text-slate-400 transition hover:text-rose-500"
											>
												<X className="h-4 w-4" />
											</button>
										</li>
									))}
								</ul>
							)}
						</section>

						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<h2 className="text-lg font-extrabold text-slate-950">Save</h2>
							<p className="mt-1 text-sm leading-6 text-slate-500">
								Changes are saved immediately and reflected on your listing right away.
							</p>

							<div className="mt-5 space-y-3">
								<button
									type="submit"
									disabled={loading}
									className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{loading ? 'Saving...' : 'Save Changes'}
								</button>
								<Link
									href={`/landlord/accommodationdetails?id=${accommodationId}`}
									className="block w-full rounded-xl border border-slate-200 bg-white py-3.5 text-center text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
								>
									Cancel
								</Link>
							</div>
						</section>
					</div>
				</form>
			</main>
		</div>
	)
}

export default EditAccommodation