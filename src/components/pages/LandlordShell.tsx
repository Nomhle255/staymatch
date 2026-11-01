'use client'

import type { ComponentType, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
	Home,
	LayoutDashboard,
	LogOut,
	Menu,
	PlusCircle,
	User,
	X,
} from 'lucide-react'
import { useEffect, useState } from 'react'

const navItems = [
	{ label: 'Dashboard', icon: LayoutDashboard, href: '/landlord/dashboard' },
	{ label: 'My Listings', icon: Home, href: '/landlord/accommodationlisting' },
	{ label: 'Add Listing', icon: PlusCircle, href: '/landlord/addaccommodation' },
	{ label: 'Profile', icon: User, href: '/profile' },
] as const

function NavigationLink({
	label,
	icon: Icon,
	href,
	onClick,
}: {
	label: string
	icon: ComponentType<{ className?: string }>
	href: string
	onClick?: () => void
}) {
	const active = usePathname() === href

	return (
		<Link
			href={href}
			onClick={onClick}
			aria-current={active ? 'page' : undefined}
			className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
				active
					? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
					: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
			}`}
		>
			<Icon className="h-4 w-4 shrink-0" />
			{label}
		</Link>
	)
}

function ProfileCard({
	displayName,
	loading,
}: {
	displayName: string
	loading: boolean
}) {
	const initial = displayName.trim().charAt(0).toUpperCase() || 'L'

	return (
		<div className="rounded-2xl bg-slate-50 p-4">
			<div className="flex items-center gap-3">
				<div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
					{loading ? '...' : initial}
				</div>
				<div className="min-w-0">
					<p className="truncate text-sm font-bold text-slate-900">
						{loading ? 'Loading...' : displayName}
					</p>
					<p className="text-xs text-slate-500">Landlord</p>
				</div>
			</div>
		</div>
	)
}

function LogoutButton({ mobile = false }: { mobile?: boolean }) {
	const router = useRouter()

	const logout = async () => {
		try {
			await fetch('/api/auth/logout', { method: 'POST' })
		} catch (error) {
			console.warn('Logout request failed:', error)
		} finally {
			router.push('/')
			router.refresh()
		}
	}

	return (
		<button
			type="button"
			onClick={logout}
			className={`${mobile ? 'mt-2' : ''} flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900`}
		>
			<LogOut className="h-4 w-4" />
			Log out
		</button>
	)
}

export default function LandlordShell({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false)
	const [displayName, setDisplayName] = useState('Landlord')
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let mounted = true

		fetch('/api/profile')
			.then(async (response) => ({
				response,
				data: await response.json().catch(() => null),
			}))
			.then(({ response, data }) => {
				if (mounted && response.ok) {
					setDisplayName(data?.user?.name?.trim() || 'Landlord')
				}
			})
			.catch((error) => console.warn('Failed to fetch landlord profile:', error))
			.finally(() => {
				if (mounted) setLoading(false)
			})

		return () => {
			mounted = false
		}
	}, [])

	return (
		<div className="flex min-h-screen w-full flex-col bg-slate-50 lg:flex-row">
			<header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white lg:hidden">
				<div className="flex items-center justify-between px-4 py-3">
					<Link href="/">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src="/brand/staymatch-logo.svg" alt="StayMatch" className="h-11 w-auto" />
					</Link>
					<button
						type="button"
						onClick={() => setOpen((value) => !value)}
						aria-expanded={open}
						aria-controls="landlord-mobile-menu"
						aria-label={open ? 'Close menu' : 'Open menu'}
						className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700"
					>
						{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
					</button>
				</div>
				{open && (
					<div id="landlord-mobile-menu" className="border-t border-slate-100 px-4 pb-4 pt-3">
						<nav className="space-y-1">
							{navItems.map((item) => (
								<NavigationLink key={item.href} {...item} onClick={() => setOpen(false)} />
							))}
						</nav>
						<div className="mt-3"><ProfileCard displayName={displayName} loading={loading} /></div>
						<LogoutButton mobile />
					</div>
				)}
			</header>

			<aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-200/70 bg-white px-4 py-6 lg:flex">
				<div>
					<Link href="/" className="flex items-center px-2">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src="/brand/staymatch-logo.svg" alt="StayMatch" className="h-11 w-auto" />
					</Link>
					<nav className="mt-8 space-y-1">
						{navItems.map((item) => <NavigationLink key={item.href} {...item} />)}
					</nav>
				</div>
				<div className="space-y-4">
					<ProfileCard displayName={displayName} loading={loading} />
					<LogoutButton />
				</div>
			</aside>

			<main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-10">
				{children}
			</main>
		</div>
	)
}
