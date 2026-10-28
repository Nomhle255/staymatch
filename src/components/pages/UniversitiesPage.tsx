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
	Plus,
	MapPin,
	Globe2,
	Menu,
	X,
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

type UniversityType = {
	id: string
	name: string
	latitude: number
	longitude: number
}

function NavButton({
	label,
	icon: Icon,
	active,
	href,
	onNavigate,
}: {
	label: string
	icon: ComponentType<{ className?: string }>
	active: boolean
	href: string
	onNavigate?: () => void
}) {
	const router = useRouter()

	return (
		<button
			type="button"
			onClick={() => {
				onNavigate?.()
				router.push(href)
			}}
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

/*
 * Top bar for screens smaller than lg, where the sidebar is hidden.
 * It holds the logo, a menu button, and a dropdown with the same
 * navigation, admin card, and log out button as the sidebar.
 */
function MobileNav({
	adminName,
	adminInitial,
	onLogout,
}: {
	adminName: string
	adminInitial: string
	onLogout: () => void
}) {
	const [open, setOpen] = useState(false)

	return (
		<header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white lg:hidden">
			<div className="flex items-center justify-between px-4 py-3">
				<div className="flex items-center gap-2.5">
					<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-base font-bold text-white shadow-lg shadow-blue-600/25">
						⌂
					</div>

					<p className="text-lg font-black tracking-[-0.03em] text-slate-950">
						Stay<span className="text-blue-600">Match</span>
					</p>
				</div>

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
								onNavigate={() => setOpen(false)}
							/>
						))}
					</nav>

					<div className="mt-3 rounded-2xl bg-slate-50 p-3">
						<div className="flex items-center gap-3">
							<div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
								{adminInitial}
							</div>

							<div className="min-w-0">
								<p className="truncate text-sm font-bold text-slate-900">
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

function UniversityCard({
	university,
}: {
	university: UniversityType
}) {
	return (
		<div className="min-w-0 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:p-5">
			<div className="flex items-start justify-between gap-3 sm:gap-4">
				<div className="flex min-w-0 items-center gap-3 sm:gap-4">
					<div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
						<University className="h-5 w-5" />
					</div>

					<div className="min-w-0">
						<h2 className="break-words text-base font-bold text-slate-950">
							{university.name}
						</h2>

						<p className="mt-1 text-xs text-slate-500">
							University location
						</p>
					</div>
				</div>

				<div className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
					Active
				</div>
			</div>

			<div className="mt-5 grid gap-3 sm:grid-cols-2">
				<div className="min-w-0 rounded-xl bg-slate-50 p-3">
					<div className="flex items-center gap-2">
						<MapPin className="h-4 w-4 text-blue-600" />

						<p className="text-xs font-medium text-slate-500">
							Latitude
						</p>
					</div>

					<p className="mt-1 break-all text-sm font-semibold text-slate-900">
						{university.latitude}
					</p>
				</div>

				<div className="min-w-0 rounded-xl bg-slate-50 p-3">
					<div className="flex items-center gap-2">
						<Globe2 className="h-4 w-4 text-blue-600" />

						<p className="text-xs font-medium text-slate-500">
							Longitude
						</p>
					</div>

					<p className="mt-1 break-all text-sm font-semibold text-slate-900">
						{university.longitude}
					</p>
				</div>
			</div>
		</div>
	)
}

export default function UniversitiesPage() {
	const router = useRouter()

	const [universities, setUniversities] = useState<
		UniversityType[]
	>([])

	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	const [adminName, setAdminName] = useState('Administrator')

	useEffect(() => {
		fetchUniversities()
		fetchProfile()
	}, [])

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

	async function fetchUniversities() {
		try {
			setLoading(true)
			setError('')

			const response = await fetch('/api/universities')

			if (!response.ok) {
				throw new Error(
					'Failed to load universities.'
				)
			}

			const data = await response.json()

			setUniversities(data)
		} catch (error) {
			console.error(
				'Failed to fetch universities:',
				error
			)

			setError(
				error instanceof Error
					? error.message
					: 'Failed to load universities.'
			)
		} finally {
			setLoading(false)
		}
	}

	function handleLogout() {
		router.push('/login')
	}

	const adminInitial = adminName.charAt(0).toUpperCase()

	return (
		<div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
			{/* Mobile and tablet: top bar with a menu (the sidebar is hidden below lg) */}
			<MobileNav
				adminName={adminName}
				adminInitial={adminInitial}
				onLogout={handleLogout}
			/>

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

			<main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-10">
				<div className="mx-auto max-w-6xl">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div className="min-w-0">
							<h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">
								Manage Universities
							</h1>

							<p className="mt-1 text-sm text-slate-500">
								Manage universities used for
								accommodation distance
								calculations.
							</p>
						</div>

						<button
							type="button"
							onClick={() =>
								router.push(
									'/admin/universities/add'
								)
							}
							className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 sm:w-auto"
						>
							<Plus className="h-4 w-4" />
							Add University
						</button>
					</div>

					<div className="mt-6 sm:mt-8">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">
									Universities
								</h2>

								<p className="mt-1 text-sm text-slate-500">
									{universities.length}{' '}
									{universities.length === 1
										? 'university'
										: 'universities'}{' '}
									registered.
								</p>
							</div>
						</div>

						{loading && (
							<div className="mt-5 rounded-2xl border border-slate-200/70 bg-white p-8 text-center shadow-sm sm:rounded-[1.75rem] sm:p-10">
								<p className="text-sm text-slate-500">
									Loading universities...
								</p>
							</div>
						)}

						{error && (
							<div className="mt-5 rounded-2xl bg-rose-50 px-5 py-4 text-sm font-medium text-rose-600">
								{error}
							</div>
						)}

						{!loading &&
							!error &&
							universities.length === 0 && (
								<div className="mt-5 rounded-2xl border border-slate-200/70 bg-white p-6 text-center shadow-sm sm:rounded-[1.75rem] sm:p-10">
									<div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600">
										<University className="h-6 w-6" />
									</div>

									<h3 className="mt-4 text-base font-bold text-slate-950">
										No universities yet
									</h3>

									<p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
										Add a university so
										StayMatch can use its
										stored coordinates when
										calculating accommodation
										distances.
									</p>

									<button
										type="button"
										onClick={() =>
											router.push(
												'/admin/universities/add'
											)
										}
										className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 sm:w-auto"
									>
										<Plus className="h-4 w-4" />
										Add University
									</button>
								</div>
							)}

						{!loading &&
							!error &&
							universities.length > 0 && (
								<div className="mt-5 grid gap-4 md:grid-cols-2">
									{universities.map(
										(university) => (
											<UniversityCard
												key={
													university.id
												}
												university={
													university
												}
											/>
										)
									)}
								</div>
							)}
					</div>
				</div>
			</main>
		</div>
	)
}