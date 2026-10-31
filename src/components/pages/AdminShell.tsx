'use client'

import type { ComponentType, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
	LayoutDashboard,
	University,
	Users,
	Building2,
	LogOut,
	Menu,
	X,
} from 'lucide-react'
import { useEffect, useState } from 'react'

const navItems = [
	{
		label: 'Dashboard',
		icon: LayoutDashboard,
		href: '/admin',
		key: 'dashboard',
	},
	{
		label: 'Universities',
		icon: University,
		href: '/admin/universities',
		key: 'universities',
	},
	{
		label: 'Landlords',
		icon: Users,
		href: '/admin/landlords',
		key: 'landlords',
	},
	{
		label: 'Accommodations',
		icon: Building2,
		href: '/admin/accommodations',
		key: 'accommodations',
	},
	{
		label: 'Profile',
		icon: Users,
		href: '/profile',
		key: 'profile',
	},
] as const

type AdminSection =
	| 'dashboard'
	| 'universities'
	| 'landlords'
	| 'accommodations'
	| 'profile'

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
			aria-current={active ? 'page' : undefined}
			className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
				active
					? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
					: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
			}`}
		>
			<Icon className="h-4 w-4 shrink-0" />
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
	active,
	displayName,
	adminInitial,
	onLogout,
}: {
	active: AdminSection
	displayName: string
	adminInitial: string
	onLogout: () => void
}) {
	const [open, setOpen] = useState(false)

	return (
		<header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white lg:hidden">
			<div className="flex items-center justify-between px-4 py-3">
					<div className="flex min-w-0 items-center gap-3">
					<div className="flex min-w-0 flex-col gap-1">
					{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src="/brand/staymatch-logo.svg" alt="StayMatch" className="h-11 w-auto" />
				</div>
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
								key={item.key}
								label={item.label}
								icon={item.icon}
								active={active === item.key}
								href={item.href}
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
									{displayName}
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

type AdminShellProps = {
	children: ReactNode
	active: AdminSection
	title: string
	subtitle?: string
	adminName?: string
}

export default function AdminShell({
	children,
	active,
	title,
	subtitle,
	adminName = 'Administrator',
}: AdminShellProps) {
	const router = useRouter()
	const [fetchedName, setFetchedName] = useState('')

	useEffect(() => {
		let mounted = true

		async function loadProfile() {
			try {
				const response = await fetch('/api/profile')
				const data = await response.json().catch(() => null)

				if (response.ok && mounted) {
					setFetchedName(data?.user?.name?.trim() || '')
				}
			} catch (error) {
				console.warn(
					'Failed to fetch admin profile:',
					error,
				)
			}
		}

		loadProfile()

		return () => {
			mounted = false
		}
	}, [])

	const displayName = fetchedName || adminName
	const adminInitial =
		displayName.trim().charAt(0).toUpperCase() || 'A'

	function handleLogout() {
		router.push('/login')
		router.refresh()
	}

	return (
		<div className="flex min-h-screen w-full flex-col bg-slate-50 lg:flex-row">
			{/* Mobile and tablet: top bar with a menu (the sidebar is hidden below lg) */}
			<MobileNav
				active={active}
				displayName={displayName}
				adminInitial={adminInitial}
				onLogout={handleLogout}
			/>

			{/* Sidebar */}
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
								key={item.key}
								label={item.label}
								icon={item.icon}
								active={active === item.key}
								href={item.href}
							/>
						))}
					</nav>
				</div>

				<div className="space-y-4">
					<div className="rounded-2xl bg-slate-50 p-4">
						<div className="flex items-center gap-3">
							<div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
								{adminInitial}
							</div>

							<div className="min-w-0">
								<p className="truncate text-sm font-bold text-slate-900">
									{displayName}
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

			{/* Main content */}
			<main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-10">
				<div className="mx-auto max-w-6xl">
					{/* Page heading */}
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div className="min-w-0">
							<h1 className="break-words text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">
								{title}
							</h1>

							{subtitle && (
								<p className="mt-1 text-sm text-slate-500">
									{subtitle}
								</p>
							)}
						</div>
					</div>

					{/* Page content */}
					<div className="mt-6 sm:mt-8">{children}</div>
				</div>
			</main>
		</div>
	)
}