
'use client'

import { useEffect, useState } from 'react'
import type { ReactNode, ComponentType, FormEvent } from 'react'
import Link from 'next/link'
import {
	LayoutDashboard,
	Search,
	Home,
	PlusCircle,
	Users,
	User,
	LogOut,
	Mail,
	Phone,
	ShieldCheck,
	Pencil,
	Check,
	Menu,
	X,
	University,
} from 'lucide-react'

type UserRole = 'STUDENT' | 'LANDLORD' | 'ADMINISTRATOR'

type UserProfile = {
	id: string
	name: string
	email: string
	phone: string | null
	role: UserRole
	createdAt?: string
}

type NavItem = {
	label: string
	icon: ComponentType<{ className?: string }>
	href: string
}

const profileNavItem: NavItem = {
	label: 'My Profile',
	icon: User,
	href: '/profile',
}

function getNavItems(role: UserRole | undefined): NavItem[] {
	switch (role) {
		case 'LANDLORD':
			return [
				{
					label: 'Dashboard',
					icon: LayoutDashboard,
					href: '/landlord/dashboard',
				},
				{
					label: 'My Listings',
					icon: Home,
					href: '/landlord/accommodationlisting',
				},
				{
					label: 'Add Listing',
					icon: PlusCircle,
					href: '/landlord/addaccommodation',
				},
				profileNavItem,
			]

		case 'ADMINISTRATOR':
			return [
				{
					label: 'Dashboard',
					icon: LayoutDashboard,
					href: '/admin',
				},
				{
					label: 'Universities',
					icon: University,
					href: '/admin/universities',
				},
				{
					label: 'Landlords',
					icon: Users,
					href: '/admin/landlords',
				},
				{
					label: 'Accommodation',
					icon: Home,
					href: '/admin/accommodations',
				},
				profileNavItem,
			]

		case 'STUDENT':
		default:
			return [
				{
					label: 'Dashboard',
					icon: LayoutDashboard,
					href: '/students/dashboard',
				},
				{
					label: 'Browse Listings',
					icon: Search,
					href: '/students/browseListings',
				},
				profileNavItem,
			]
	}
}

const roleLabels: Record<UserRole, string> = {
	STUDENT: 'Student',
	LANDLORD: 'Landlord',
	ADMINISTRATOR: 'Administrator',
}

// Text-base on phones stops iOS from zooming in when a field is focused.
const inputClasses =
	'w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-base text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 sm:text-sm'

// Shared logout function for both mobile and desktop navigation.
async function handleLogout() {
	try {
		const response = await fetch('/api/auth/logout', {
			method: 'POST',
			credentials: 'same-origin',
		})

		if (!response.ok) {
			throw new Error('Logout failed')
		}

		window.location.href = '/login'
	} catch (error) {
		console.error('Logout error:', error)
	}
}

function SidebarShell({ children }: { children: ReactNode }) {
	return (
		<aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-200/70 bg-white px-4 py-6 lg:flex">
			{children}
		</aside>
	)}

/*
 * Top bar for screens smaller than lg, where the sidebar is hidden.
 * It holds the logo, a menu button, and the dropdown navigation.
 */
function MobileNav({
	navItems,
	name,
	roleLabel,
	initial,
	loading,
}: {
	navItems: NavItem[]
	name: string
	roleLabel: string
	initial: string
	loading: boolean
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
						{navItems.map((item) => {
							const Icon = item.icon
							const active = item.href === '/profile'

							return (
								<Link
									key={item.label}
									href={item.href}
									onClick={() => setOpen(false)}
									className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
										active
											? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
											: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
									}`}
								>
									<Icon className="h-4 w-4" />
									{item.label}
								</Link>
							)
						})}
					</nav>

					<div className="mt-3 rounded-2xl bg-slate-50 p-3">
						<div className="flex items-center gap-3">
							<div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
								{initial}
							</div>
							<div className="min-w-0">
								<p className="truncate text-sm font-bold text-slate-900">
									{loading ? 'Loading...' : name || 'User'}
								</p>
								<p className="text-xs text-slate-500">
									{roleLabel}
								</p>
							</div>
						</div>
					</div>

					<button
						type="button"
						onClick={handleLogout}
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

function Row({
	icon: Icon,
	label,
	children,
}: {
	icon: ComponentType<{ className?: string }>
	label: string
	children: ReactNode
}) {
	return (
		<div className="flex items-start gap-3 border-b border-slate-100 py-4 last:border-b-0">
			<span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
				<Icon className="h-4 w-4" />
			</span>

			<div className="min-w-0">
				<p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
					{label}
				</p>
				<div className="mt-0.5 break-words text-sm font-semibold text-slate-800">
					{children}
				</div>
			</div>
		</div>
	)
}

function Profile() {
	const [profile, setProfile] = useState<UserProfile | null>(null)
	const [loading, setLoading] = useState(true)
	const [loadError, setLoadError] = useState('')

	const [isEditing, setIsEditing] = useState(false)
	const [name, setName] = useState('')
	const [phone, setPhone] = useState('')
	const [email, setEmail] = useState('')

	const [saving, setSaving] = useState(false)
	const [saveError, setSaveError] = useState('')
	const [successMessage, setSuccessMessage] = useState('')

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				setLoading(true)
				setLoadError('')

				const response = await fetch('/api/profile', {
					credentials: 'same-origin',
					cache: 'no-store',
				})

				const data = await response.json().catch(() => null)

				if (!response.ok || !data?.user) {
					throw new Error(
						data?.error || 'Failed to load your profile.',
					)
				}

				const user = data.user as UserProfile

				if (
					!user.id ||
					!user.name ||
					!user.email ||
					!['STUDENT', 'LANDLORD', 'ADMINISTRATOR'].includes(
						user.role,
					)
				) {
					throw new Error('The profile response is invalid.')
				}

				setProfile(user)
			} catch (error) {
				console.error('Failed to fetch profile:', error)

				setLoadError(
					error instanceof Error
						? error.message
						: 'Something went wrong while loading your profile.',
				)
			} finally {
				setLoading(false)
			}
		}

		void fetchProfile()
	}, [])

	const startEditing = () => {
		if (!profile) return

		setName(profile.name)
		setPhone(profile.phone ?? '')
		setEmail(profile.email)
		setSaveError('')
		setSuccessMessage('')
		setIsEditing(true)
	}

	const cancelEditing = () => {
		setIsEditing(false)
		setSaveError('')
	}

	const hasChanges =
		profile !== null &&
		(name.trim() !== profile.name ||
			phone.trim() !== (profile.phone ?? '') ||
			email.trim() !== profile.email)

	const handleSave = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (!profile || saving) return

		setSaveError('')
		setSuccessMessage('')
		setSaving(true)

		try {
			const response = await fetch('/api/profile', {
				method: 'PATCH',
				credentials: 'same-origin',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: name.trim(),
					phone: phone.trim(),
					email: email.trim(),
				}),
			})

			const data = await response.json().catch(() => null)

			if (!response.ok || !data?.user) {
				throw new Error(data?.error || 'Something went wrong.')
			}

			setProfile(data.user as UserProfile)
			setIsEditing(false)
			setSuccessMessage('Your profile has been updated.')
		} catch (error) {
			setSaveError(
				error instanceof Error
					? error.message
					: 'Could not reach the server. Please try again.',
			)
		} finally {
			setSaving(false)
		}
	}

	const navItems = getNavItems(profile?.role)

	const initial = profile?.name
		? profile.name.charAt(0).toUpperCase()
		: '?'

	const isLandlord = profile?.role === 'LANDLORD'

	return (
		<div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
			{/* Mobile and tablet navigation */}
			<MobileNav
				navItems={navItems}
				name={profile?.name || ''}
				roleLabel={profile ? roleLabels[profile.role] : ''}
				initial={initial}
				loading={loading}
			/>

			{/* Desktop sidebar */}
			<SidebarShell>
				<div>
					<Link href="/" className="flex items-center gap-3 px-2">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/brand/staymatch-logo.svg"
							alt="StayMatch"
							className="h-11 w-auto"
						/>
					</Link>

					<nav className="mt-8 space-y-1">
						{navItems.map((item) => {
							const Icon = item.icon
							const active = item.href === '/profile'

							return (
								<Link
									key={item.label}
									href={item.href}
									className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
										active
											? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
											: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
									}`}
								>
									<Icon className="h-4 w-4" />
									{item.label}
								</Link>
							)
						})}
					</nav>
				</div>

				<div className="space-y-4">
					<div className="rounded-2xl bg-slate-50 p-4">
						<div className="flex items-center gap-3">
							<div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
								{initial}
							</div>
							<div className="min-w-0">
								<p className="truncate text-sm font-bold text-slate-900">
									{loading
										? 'Loading...'
										: profile?.name || 'User'}
								</p>
								<p className="text-xs text-slate-500">
									{profile ? roleLabels[profile.role] : ''}
								</p>
							</div>
						</div>
					</div>

					{/* Desktop logout button */}
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

			{/* Main content */}
			<main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-10">
				<div>
					<h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">
						My Profile
					</h1>
					<p className="mt-1 text-sm text-slate-500">
						View and update your account details.
					</p>
				</div>

				{loading && (
					<div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center sm:p-10">
						<p className="text-sm font-semibold text-slate-600">
							Loading your profile...
						</p>
					</div>
				)}

				{loadError && !loading && (
					<div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center sm:p-6">
						<p className="text-sm font-semibold text-rose-700">
							{loadError}
						</p>
						<Link
							href="/login"
							className="mt-4 inline-block rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
						>
							Go to login
						</Link>
					</div>
				)}

				{!loading && !loadError && profile && (
					<div className="mt-6 max-w-2xl">
						{successMessage && (
							<div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
								<Check className="h-4 w-4 shrink-0" />
								{successMessage}
							</div>
						)}

						<section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm sm:rounded-[1.75rem] sm:p-6">
							<div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
								<div className="flex min-w-0 items-center gap-4">
									<div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-600/25">
										{initial}
									</div>
									<div className="min-w-0">
										<h2 className="break-words text-xl font-black tracking-[-0.03em] text-slate-950">
											{profile.name}
										</h2>
										<span className="mt-1 inline-block rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
											{roleLabels[profile.role]}
										</span>
									</div>
								</div>

								{!isEditing && (
									<button
										type="button"
										onClick={startEditing}
										className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 sm:w-auto"
									>
										<Pencil className="h-4 w-4" />
										Edit profile
									</button>
								)}
							</div>

							{!isEditing ? (
								<div className="mt-6">
									<Row icon={User} label="Full name">
										{profile.name}
									</Row>
									<Row icon={Mail} label="Email address">
										{profile.email}
									</Row>
									<Row icon={Phone} label="Phone number">
										{profile.phone || (
											<span className="font-medium text-slate-400">
												Not added yet
											</span>
										)}
									</Row>
									<Row icon={ShieldCheck} label="Account type">
										{roleLabels[profile.role]}
									</Row>
								</div>
							) : (
								<form
									className="mt-6 space-y-5"
									onSubmit={handleSave}
								>
									{saveError && (
										<div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
											{saveError}
										</div>
									)}

									<label className="grid gap-2">
										<span className="text-sm font-bold text-slate-900">
											Full name
										</span>
										<div className="relative">
											<User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
											<input
												type="text"
												value={name}
												onChange={(event) =>
													setName(event.target.value)
												}
												placeholder="Enter your full name"
												required
												maxLength={100}
												className={inputClasses}
											/>
										</div>
									</label>

									<label className="grid gap-2">
										<span className="text-sm font-bold text-slate-900">
											Email address
										</span>
										<div className="relative">
											<Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
											<input
												type="email"
												value={email}
												onChange={(event) =>
													setEmail(event.target.value)
												}
												placeholder="Enter your email address"
												required
												className={inputClasses}
											/>
										</div>
									</label>

									<label className="grid gap-2">
										<span className="text-sm font-bold text-slate-900">
											{isLandlord
												? 'Phone / WhatsApp number'
												: 'Phone number (optional)'}
										</span>
										<div className="relative">
											<Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
											<input
												type="tel"
												value={phone}
												onChange={(event) =>
													setPhone(event.target.value)
												}
												placeholder="+266 XXX XXX"
												required={isLandlord}
												className={inputClasses}
											/>
										</div>

										{isLandlord && (
											<p className="text-xs text-slate-400">
												Students use this number to contact you about your rooms.
											</p>
										)}
									</label>

									<div className="flex flex-col gap-3 pt-1 sm:flex-row">
										<button
											type="submit"
											disabled={saving || !hasChanges}
											className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
										>
											{saving
												? 'Saving...'
												: 'Save changes'}
										</button>
										<button
											type="button"
											onClick={cancelEditing}
											disabled={saving}
											className="w-full rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60 sm:w-auto"
										>
											Cancel
										</button>
									</div>
								</form>
							)}
						</section>
					</div>
				)}
			</main>
		</div>
	)
}

export default Profile
