'use client'

import {
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
	MapPin,
	FileText,
	ChevronDown,
	BedDouble,
	Bath,
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
	{ label: 'Shared Apartment', value: 'SHARED_APARTMENT' },
	{ label: 'Studio Flat', value: 'STUDIO_FLAT' },
	{ label: 'En-suite', value: 'EN_SUITE' },
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

function AddAccommodation() {
	const [title, setTitle] = useState('')
	const [propertyType, setPropertyType] = useState('')
	const [price, setPrice] = useState('')
	const [area, setArea] = useState('')
	const [description, setDescription] = useState('')
	const [bedrooms, setBedrooms] = useState('1')
	const [bathrooms, setBathrooms] = useState('1')
	const [availableFrom, setAvailableFrom] = useState('')

	const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
	const [photos, setPhotos] = useState<string[]>([])

	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState('')
	const [error, setError] = useState('')

	const toggleAmenity = (label: string) => {
		setSelectedAmenities((current) =>
			current.includes(label)
				? current.filter((item) => item !== label)
				: [...current, label],
		)
	}

	const handlePhotoSelect = (
		event: ChangeEvent<HTMLInputElement>,
	) => {
		const files = event.target.files

		if (!files) return

		const names = Array.from(files).map((file) => file.name)

		setPhotos((current) => [...current, ...names])
	}

	const removePhoto = (index: number) => {
		setPhotos((current) =>
			current.filter((_, i) => i !== index),
		)
	}

	const handleSubmit = async (
		event: FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault()

		setLoading(true)
		setMessage('')
		setError('')

		try {
			const response = await fetch(
				'/api/addaccommodation',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						title,
						propertyType,
						price: Number(price),
						area,
						description,
						bedrooms: Number(bedrooms),
						bathrooms: Number(bathrooms),
						availableFrom: availableFrom || null,
						amenities: selectedAmenities,
						photos,
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

			setMessage(
				'Accommodation submitted successfully. It is now pending review.',
			)

			setTitle('')
			setPropertyType('')
			setPrice('')
			setArea('')
			setDescription('')
			setBedrooms('1')
			setBathrooms('1')
			setAvailableFrom('')
			setSelectedAmenities([])
			setPhotos([])
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
						Fill in the details below to publish a listing for students to find.
					</p>
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

				<form
					onSubmit={handleSubmit}
					className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]"
				>
					<div className="space-y-6">
						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<h2 className="text-lg font-extrabold text-slate-950">
								Basic information
							</h2>

							<div className="mt-5 space-y-5">
								<Field label="Listing title">
									<input
										type="text"
										value={title}
										onChange={(event) =>
											setTitle(event.target.value)
										}
										placeholder="e.g. Spacious student room in Roma"
										required
										className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
									/>
								</Field>

								<div className="grid gap-5 sm:grid-cols-2">
									<Field label="Property type">
										<div className="relative">
											<select
												value={propertyType}
												onChange={(event) =>
													setPropertyType(
														event.target.value,
													)
												}
												required
												className={`${inputClasses} appearance-none pl-4`}
											>
												<option value="" disabled>
													Select type
												</option>

												{propertyTypes.map(
													(type) => (
														<option
															key={type.value}
															value={type.value}
														>
															{type.label}
														</option>
													),
												)}
											</select>

											<ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
										</div>
									</Field>

									<Field label="Monthly rent (M)">
										<input
											type="number"
											value={price}
											onChange={(event) =>
												setPrice(event.target.value)
											}
											placeholder="2800"
											required
											min="0"
											className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
										/>
									</Field>
								</div>

								<Field label="Area / Location">
									<InputShell icon={MapPin}>
										<input
											type="text"
											value={area}
											onChange={(event) =>
												setArea(event.target.value)
											}
											placeholder="e.g. Roma, Maseru"
											required
											className={inputClasses}
										/>
									</InputShell>
								</Field>

								<Field label="Description">
									<div className="relative">
										<FileText className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />

										<textarea
											rows={4}
											value={description}
											onChange={(event) =>
												setDescription(
													event.target.value,
												)
											}
											placeholder="Describe the property, what's nearby, and what makes it a good fit for students..."
											required
											className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
										/>
									</div>
								</Field>
							</div>
						</section>

						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<h2 className="text-lg font-extrabold text-slate-950">
								Property details
							</h2>

							<div className="mt-5 grid gap-5 sm:grid-cols-3">
								<Field label="Bedrooms">
									<InputShell icon={BedDouble}>
										<input
											type="number"
											value={bedrooms}
											onChange={(event) =>
												setBedrooms(
													event.target.value,
												)
											}
											min="1"
											required
											className={inputClasses}
										/>
									</InputShell>
								</Field>

								<Field label="Bathrooms">
									<InputShell icon={Bath}>
										<input
											type="number"
											value={bathrooms}
											onChange={(event) =>
												setBathrooms(
													event.target.value,
												)
											}
											min="1"
											required
											className={inputClasses}
										/>
									</InputShell>
								</Field>

								<Field label="Available from">
									<InputShell icon={CalendarClock}>
										<input
											type="date"
											value={availableFrom}
											onChange={(event) =>
												setAvailableFrom(
													event.target.value,
												)
											}
											className={`${inputClasses} text-slate-500`}
										/>
									</InputShell>
								</Field>
							</div>
						</section>

						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<h2 className="text-lg font-extrabold text-slate-950">
								Amenities
							</h2>

							<div className="mt-5 grid gap-3 sm:grid-cols-2">
								{amenitiesList.map((amenity) => {
									const isSelected =
										selectedAmenities.includes(
											amenity.label,
										)

									const Icon = amenity.icon

									return (
										<button
											type="button"
											key={amenity.label}
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
											{amenity.label}
										</button>
									)
								})}
							</div>
						</section>
					</div>

					<div className="space-y-6">
						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<h2 className="text-lg font-extrabold text-slate-950">
								Photos
							</h2>

							<p className="mt-1 text-sm text-slate-500">
								Add clear photos of the room, common areas, and exterior.
							</p>

							<label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center transition hover:border-blue-300 hover:bg-blue-50/40">
								<UploadCloud className="h-6 w-6 text-slate-400" />

								<p className="text-sm font-semibold text-slate-600">
									Click to upload photos
								</p>

								<p className="text-xs text-slate-400">
									PNG or JPG, up to 5MB each
								</p>

								<input
									type="file"
									accept="image/*"
									multiple
									className="hidden"
									onChange={handlePhotoSelect}
								/>
							</label>

							{photos.length > 0 && (
								<ul className="mt-4 space-y-2">
									{photos.map((name, index) => (
										<li
											key={`${name}-${index}`}
											className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600"
										>
											<span className="truncate">
												{name}
											</span>

											<button
												type="button"
												onClick={() =>
													removePhoto(index)
												}
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
							<h2 className="text-lg font-extrabold text-slate-950">
								Publish
							</h2>

							<p className="mt-1 text-sm leading-6 text-slate-500">
								New listings are reviewed before appearing as
								"Verified" to students.
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