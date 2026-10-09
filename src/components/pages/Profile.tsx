'use client'

import { useEffect, useState } from 'react'
import type { ReactNode, ComponentType } from 'react'
import Link from 'next/link'
import {
	LayoutDashboard,
	Search,
	FileText,
	Home,
	PlusCircle,
	Users,
	User,
	LogOut,
	Mail,
	Phone,
	CalendarDays,
	ShieldCheck,
	Pencil,
	Check,
} from 'lucide-react'

type UserProfile = {
	id: string
	name: string
	email: string
	phone: string | null
	role: 'STUDENT' | 'LANDLORD' | 'ADMINISTRATOR'
	createdAt: string
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

function getNavItems(role: UserProfile['role'] | undefined): NavItem[] {
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
				{
					label: 'Applications',
					icon: Users,
					href: '/landlord/applications',
				},
				profileNavItem,
			]

		case 'ADMINISTRATOR':
			return [
				{ label: 'Landlords', icon: Users, href: '/admin/landlords' },
				{
					label: 'Accommodation',
					icon: Home,
					href: '/admin/accommodations',
				},
				profileNavItem,
			]

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
				{
					label: 'Applications',
					icon: FileText,
					href: '/students/applications',
				},
				profileNavItem,
			]
	}
}

const roleLabels: Record<UserProfile['role'], string> = {
	STUDENT: 'Student',
	LANDLORD: 'Landlord',
	ADMINISTRATOR: 'Administrator',
}

const inputClasses =
	'w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'

function formatDate(value: string) {
	const date = new Date(value)

	if (Number.isNaN(date.getTime())) return '—'

	return date.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})
}

function SidebarShell({ children }: { children: ReactNode }) {
	return (
		<aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-200/70 bg-white px-4 py-6 lg:flex">
			{children}
		</aside>
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

	const [saving, setSaving] = useState(false)
	const [saveError, setSaveError] = useState('')
	const [successMessage, setSuccessMessage] = useState('')

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				setLoading(true)
				setLoadError('')

				const response = await fetch('/api/profile')

				const data = await response.json().catch(() => null)

				if (!response.ok || !data) {
					throw new Error(data?.error || 'Failed to load your profile.')
				}

				setProfile(data.user)
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

		fetchProfile()
	}, [])

	const startEditing = () => {
		if (!profile) return

		setName(profile.name)
		setPhone(profile.phone ?? '')
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
		(name.trim() !== profile.name || phone.trim() !== (profile.phone ?? ''))

	const handleSave = async (event: React.FormEvent) => {
		event.preventDefault()

		if (!profile) return

		setSaveError('')
		setSaving(true)

		try {
			const response = await fetch('/api/profile', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, phone }),
			})

			const data = await response.json().catch(() => null)

			if (!response.ok || !data) {
				setSaveError(data?.error ?? 'Something went wrong.')
				setSaving(false)
				return
			}

			setProfile(data.user)
			setIsEditing(false)
			setSuccessMessage('Your profile has been updated.')
			setSaving(false)
		} catch {
			setSaveError('Could not reach the server. Please try again.')
			setSaving(false)
		}
	}

	const navItems = getNavItems(profile?.role)
	const initial = profile?.name ? profile.name.charAt(0).toUpperCase() : '?'
	const isLandlord = profile?.role === 'LANDLORD'

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

							<div>
								<p className="text-sm font-bold text-slate-900">
									{loading ? 'Loading...' : profile?.name || 'User'}
								</p>

								<p className="text-xs text-slate-500">
									{profile ? roleLabels[profile.role] : ''}
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

			<main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10">
				<div>
					<h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">
						My Profile
					</h1>

					<p className="mt-1 text-sm text-slate-500">
						View and update your account details.
					</p>
				</div>

				{loading && (
					<div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
						<p className="text-sm font-semibold text-slate-600">
							Loading your profile...
						</p>
					</div>
				)}

				{loadError && !loading && (
					<div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
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
								<Check className="h-4 w-4" />
								{successMessage}
							</div>
						)}

						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
							<div className="flex flex-wrap items-center justify-between gap-4">
								<div className="flex items-center gap-4">
									<div className="grid h-16 w-16 place-items-center rounded-full bg-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-600/25">
										{initial}
									</div>

									<div>
										<h2 className="text-xl font-black tracking-[-0.03em] text-slate-950">
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
										className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
									>
										<Pencil className="h-4 w-4" />
										Edit profile
									</button>
								)}
							</div>

							{!isEditing ? (
								/* VIEW MODE */
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

									<Row icon={CalendarDays} label="Member since">
										{formatDate(profile.createdAt)}
									</Row>
								</div>
							) : (
								/* EDIT MODE */
								<form className="mt-6 space-y-5" onSubmit={handleSave}>
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
												onChange={(event) => setName(event.target.value)}
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
												value={profile.email}
												disabled
												className={`${inputClasses} cursor-not-allowed bg-slate-50 text-slate-500`}
											/>
										</div>

										<p className="text-xs text-slate-400">
											Your email can&apos;t be changed.
										</p>
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
												onChange={(event) => setPhone(event.target.value)}
												placeholder="+266 XXX XXX"
												required={isLandlord}
												className={inputClasses}
											/>
										</div>

										{isLandlord && (
											<p className="text-xs text-slate-400">
												Students use this number to contact you about
												your rooms.
											</p>
										)}
									</label>

									<div className="flex flex-wrap gap-3 pt-1">
										<button
											type="submit"
											disabled={saving || !hasChanges}
											className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
										>
											{saving ? 'Saving...' : 'Save changes'}
										</button>

										<button
											type="button"
											onClick={cancelEditing}
											disabled={saving}
											className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
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