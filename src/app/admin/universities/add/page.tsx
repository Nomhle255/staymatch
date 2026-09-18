'use client'

import type { ComponentType, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
	LayoutDashboard,
	University,
	Users,
	Building2,
	LogOut,
	ArrowLeft,
	MapPin,
	Search,
	Save,
	CheckCircle2,
} from 'lucide-react'

const navItems = [
	{
		label: 'Dashboard',
		icon: LayoutDashboard,
		active: false,
		href: '/admin',
	},
	{
		label: 'Universities',
		icon: University,
		active: true,
		href: '/admin/universities',
	},
	{
		label: 'Landlords',
		icon: Users,
		active: false,
		href: '/admin/landlords',
	},
	{
		label: 'Accommodations',
		icon: Building2,
		active: false,
		href: '/admin/accommodations',
	},
]

type GeocodingResult = {
	lat: string
	lon: string
	display_name: string
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
	const router = useRouter()

	return (
		<button
			type="button"
			onClick={() => router.push(href)}
			className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
				active
					? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
					: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
			}`}
		>
			<Icon className="h-4 w-4" />
			{label}
		</button>
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

export default function AddUniversityPage() {
	const router = useRouter()

	const [adminName, setAdminName] = useState('Administrator')

	const [name, setName] = useState('')
	const [location, setLocation] = useState('')
	const [latitude, setLatitude] = useState('')
	const [longitude, setLongitude] = useState('')

	const [results, setResults] = useState<GeocodingResult[]>([])
	const [loading, setLoading] = useState(false)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		async function fetchProfile() {
			try {
				const response = await fetch('/api/profile')

				if (!response.ok) {
					return
				}

				const data = await response.json()

				if (data.user?.name) {
					setAdminName(data.user.name)
				}
			} catch (error) {
				console.error(
					'Failed to fetch admin profile:',
					error
				)
			}
		}

		fetchProfile()
	}, [])

	const adminInitial = adminName.charAt(0).toUpperCase()

	async function findCoordinates() {
		if (!location.trim()) {
			setError('Please enter a location.')
			return
		}

		setLoading(true)
		setError('')
		setResults([])

		try {
			const response = await fetch(
				'/api/universities/geocode',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						location: location.trim(),
					}),
				}
			)

			const data = await response.json()

			if (!response.ok) {
				throw new Error(
					data.error || 'Failed to find location.'
				)
			}

			if (data.length === 0) {
				setError('No matching location was found.')
				return
			}

			setResults(data)
		} catch (error) {
			console.error(error)

			setError(
				error instanceof Error
					? error.message
					: 'Failed to find coordinates.'
			)
		} finally {
			setLoading(false)
		}
	}

	function selectLocation(result: GeocodingResult) {
		setLatitude(result.lat)
		setLongitude(result.lon)
		setResults([])
		setError('')
	}

	async function saveUniversity() {
		if (!name.trim()) {
			setError('University name is required.')
			return
		}

		if (!latitude || !longitude) {
			setError(
				'Please find and select the university location first.'
			)
			return
		}

		setSaving(true)
		setError('')

		try {
			const response = await fetch('/api/universities', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: name.trim(),
					latitude,
					longitude,
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(
					data.error || 'Failed to save university.'
				)
			}

			router.push('/admin/universities')
		} catch (error) {
			console.error(error)

			setError(
				error instanceof Error
					? error.message
					: 'Failed to save university.'
			)
		} finally {
			setSaving(false)
		}
	}

	function handleLogout() {
		router.push('/login')
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
							Stay
							<span className="text-blue-600">
								Match
							</span>
						</p>
					</div>

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
								{adminInitial}
							</div>

							<div>
								<p className="text-sm font-bold text-slate-900">
									{adminName}
								</p>

								<p className="text-xs text-slate-500">
									Administrator
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

			<main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">
				<div className="mx-auto max-w-4xl">
					<button
						type="button"
						onClick={() =>
							router.push('/admin/universities')
						}
						className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Universities
					</button>

					<div>
						<h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">
							Add University
						</h1>

						<p className="mt-1 text-sm text-slate-500">
							Add a university and store its coordinates
							for accommodation distance calculations.
						</p>
					</div>

					<div className="mt-8 rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8">
						<div className="mb-8 flex items-start gap-4">
							<div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
								<University className="h-5 w-5" />
							</div>

							<div>
								<h2 className="text-base font-extrabold text-slate-950">
									University Information
								</h2>

								<p className="mt-1 text-sm leading-6 text-slate-500">
									Enter the university name and search
									for its location to retrieve the
									coordinates.
								</p>
							</div>
						</div>

						<div className="space-y-6">
							<div>
								<label className="mb-2 block text-sm font-semibold text-slate-800">
									University Name
								</label>

								<input
									type="text"
									value={name}
									onChange={(event) =>
										setName(
											event.target.value
										)
									}
									placeholder="e.g. Botho University"
									className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
								/>
							</div>

							<div>
								<label className="mb-2 block text-sm font-semibold text-slate-800">
									Location
								</label>

								<div className="flex flex-col gap-3 sm:flex-row">
									<div className="relative flex-1">
										<MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

										<input
											type="text"
											value={location}
											onChange={(
												event
											) =>
												setLocation(
													event.target
														.value
												)
											}
											placeholder="e.g. Botho University, Maseru, Lesotho"
											className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
										/>
									</div>

									<button
										type="button"
										onClick={
											findCoordinates
										}
										disabled={loading}
										className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
									>
										<Search className="h-4 w-4" />

										{loading
											? 'Searching...'
											: 'Find Coordinates'}
									</button>
								</div>

								<p className="mt-2 text-xs text-slate-400">
									Enter the university name and
									location as accurately as possible.
								</p>
							</div>

							{results.length > 0 && (
								<div className="overflow-hidden rounded-2xl border border-slate-200">
									<div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
										<p className="text-sm font-bold text-slate-900">
											Select the correct
											location
										</p>

										<p className="mt-1 text-xs text-slate-500">
											Choose the result that
											corresponds to the
											university.
										</p>
									</div>

									<div>
										{results.map(
											(result, index) => (
												<button
													key={`${result.lat}-${result.lon}-${index}`}
													type="button"
													onClick={() =>
														selectLocation(
															result
														)
													}
													className="flex w-full items-start gap-4 border-b border-slate-100 p-5 text-left transition last:border-b-0 hover:bg-blue-50"
												>
													<div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
														<MapPin className="h-4 w-4" />
													</div>

													<div className="min-w-0">
														<p className="text-sm font-semibold leading-5 text-slate-900">
															{
																result.display_name
															}
														</p>

														<p className="mt-1 text-xs text-slate-500">
															{
																result.lat
															}
															,{' '}
															{
																result.lon
															}
														</p>
													</div>
												</button>
											)
										)}
									</div>
								</div>
							)}

							<div>
								<div className="mb-3">
									<h3 className="text-sm font-bold text-slate-900">
										Coordinates
									</h3>

									<p className="mt-1 text-xs text-slate-500">
										These coordinates will be stored
										with the university.
									</p>
								</div>

								<div className="grid gap-4 sm:grid-cols-2">
									<div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
										<div className="flex items-center gap-2">
											<MapPin className="h-4 w-4 text-blue-600" />

											<p className="text-xs font-semibold text-slate-500">
												Latitude
											</p>
										</div>

										<p className="mt-2 min-h-5 text-sm font-semibold text-slate-900">
											{latitude ||
												'Not selected'}
										</p>
									</div>

									<div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
										<div className="flex items-center gap-2">
											<MapPin className="h-4 w-4 text-blue-600" />

											<p className="text-xs font-semibold text-slate-500">
												Longitude
											</p>
										</div>

										<p className="mt-2 min-h-5 text-sm font-semibold text-slate-900">
											{longitude ||
												'Not selected'}
										</p>
									</div>
								</div>
							</div>

							{error && (
								<div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
									{error}
								</div>
							)}

							<div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
								<button
									type="button"
									onClick={() =>
										router.push(
											'/admin/universities'
										)
									}
									className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
								>
									Cancel
								</button>

								<button
									type="button"
									onClick={saveUniversity}
									disabled={saving}
									className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{saving ? (
										<>
											<CheckCircle2 className="h-4 w-4" />
											Saving...
										</>
									) : (
										<>
											<Save className="h-4 w-4" />
											Save University
										</>
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}