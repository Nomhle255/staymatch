import { useState } from 'react'
import type { ReactNode, ComponentType } from 'react'
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
	{ label: 'Dashboard', icon: LayoutDashboard, active: false },
	{ label: 'My Listings', icon: Home, active: false },
	{ label: 'Add Listing', icon: PlusCircle, active: true },
	{ label: 'Applications', icon: Users, active: false },
]

const propertyTypes = ['Single Room', 'Shared Apartment', 'Studio Flat', 'En-suite']

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

function NavButton({ label, icon: Icon, active }: { label: string; icon: ComponentType<{ className?: string }>; active: boolean }) {
	return (
		<button
			type="button"
			className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
				active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
			}`}
		>
			<Icon className="h-4 w-4" />
			{label}
		</button>
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
	const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
	const [photos, setPhotos] = useState<string[]>([])

	const toggleAmenity = (label: string) => {
		setSelectedAmenities((current) =>
			current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
		)
	}

	const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files
		if (!files) return
		const names = Array.from(files).map((file) => file.name)
		setPhotos((current) => [...current, ...names])
	}

	return (
		<div className="flex min-h-screen bg-slate-50">
			<SidebarShell>
				<div>
					<div className="flex items-center gap-3 px-2">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/25">
							⌂
						</div>
						<p className="text-lg font-black tracking-[-0.03em] text-slate-950">
							Stay<span className="text-blue-600">Match</span>
						</p>
					</div>

					<nav className="mt-8 space-y-1">
						{navItems.map((item) => (
							<NavButton key={item.label} {...item} />
						))}
					</nav>
				</div>

				<div className="space-y-4">
					<div className="rounded-2xl bg-slate-50 p-4">
						<div className="flex items-center gap-3">
							<div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">T</div>
							<div>
								<p className="text-sm font-bold text-slate-900">Khaya Cathala</p>
								<p className="text-xs text-slate-500">Landlord</p>
							</div>
						</div>
					</div>
					<button
						type="button"
						className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
					>
						<LogOut className="h-4 w-4" />
						Log out
					</button>
				</div>
			</SidebarShell>

			<main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">Add a New Listing</h1>
						<p className="mt-1 text-sm text-slate-500">Fill in the details below to publish a listing for students to find.</p>
					</div>
				</div>

				<form className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
					<div className="space-y-6">
						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<h2 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">Basic information</h2>
							<div className="mt-5 space-y-5">

								<div className="grid gap-5 sm:grid-cols-2">
									<Field label="Property type">
										<div className="relative">
											<select defaultValue="" className={`${inputClasses} appearance-none pl-4`}>
												<option value="" disabled>
													Select type
												</option>
												{propertyTypes.map((type) => (
													<option key={type} value={type}>
														{type}
													</option>
												))}
											</select>
											<ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
										</div>
									</Field>

									<Field label="Monthly rent (M)">
										<input
											type="number"
											placeholder="2800"
											className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
										/>
									</Field>
								</div>

								<Field label="Area / Location">
									<InputShell icon={MapPin}>
										<input type="text" placeholder="e.g. Roma, Maseru" className={inputClasses} />
									</InputShell>
								</Field>

								<Field label="Description">
									<div className="relative">
										<FileText className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />
										<textarea
											rows={4}
											placeholder="Describe the property, what's nearby, and what makes it a good fit for students..."
											className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
										/>
									</div>
								</Field>
							</div>
						</section>

						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<h2 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">Property details</h2>
							<div className="mt-5 grid gap-5 sm:grid-cols-3">
								<Field label="Bedrooms">
									<InputShell icon={BedDouble}>
										<input type="number" placeholder="1" className={inputClasses} />
									</InputShell>
								</Field>
								<Field label="Bathrooms">
									<InputShell icon={Bath}>
										<input type="number" placeholder="1" className={inputClasses} />
									</InputShell>
								</Field>
								<Field label="Available from">
									<InputShell icon={CalendarClock}>
										<input type="date" className={`${inputClasses} text-slate-500`} />
									</InputShell>
								</Field>
							</div>
						</section>

						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<h2 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">Amenities</h2>
							<div className="mt-5 grid gap-3 sm:grid-cols-2">
								{amenitiesList.map((amenity) => {
									const isSelected = selectedAmenities.includes(amenity.label)
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
											<amenity.icon className="h-4 w-4 shrink-0" />
											{amenity.label}
										</button>
									)
								})}
							</div>
						</section>
					</div>

					<div className="space-y-6">
						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<h2 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">Photos</h2>
							<p className="mt-1 text-sm text-slate-500">Add clear photos of the room, common areas, and exterior.</p>

							<label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center transition hover:border-blue-300 hover:bg-blue-50/40">
								<UploadCloud className="h-6 w-6 text-slate-400" />
								<p className="text-sm font-semibold text-slate-600">Click to upload photos</p>
								<p className="text-xs text-slate-400">PNG or JPG, up to 5MB each</p>
								<input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
							</label>

							{photos.length > 0 && (
								<ul className="mt-4 space-y-2">
									{photos.map((name, index) => (
										<li key={`${name}-${index}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
											<span className="truncate">{name}</span>
											<button
												type="button"
												onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))}
												className="text-slate-400 transition hover:text-rose-500"
												aria-label={`Remove ${name}`}
											>
												<X className="h-4 w-4" />
											</button>
										</li>
									))}
								</ul>
							)}
						</section>

						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<h2 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">Publish</h2>
							<p className="mt-1 text-sm leading-6 text-slate-500">
								New listings are reviewed before appearing as "Verified" to students. You can save a draft and finish later.
							</p>
							<div className="mt-5 space-y-3">
								<button
									type="submit"
									className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
								>
									Publish Listing
								</button>
								<button
									type="button"
									className="w-full rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
								>
									Save as Draft
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