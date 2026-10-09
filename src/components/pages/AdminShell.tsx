'use client'

import type { ComponentType, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
	LayoutDashboard,
	University,
	Users,
	Building2,
	LogOut,
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
] as const

type AdminSection =
	| 'dashboard'
	| 'universities'
	| 'landlords'
	| 'accommodations'

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
		<div className="flex min-h-screen w-full bg-slate-50">
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
			<main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10">
				<div className="mx-auto max-w-6xl">
					{/* Page heading */}
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div>
							<h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">
								{title}
							</h1>

							{subtitle && (
								<p className="mt-1 text-sm text-slate-500">
									{subtitle}
								</p>
							)}
						</div>
					</div>

					{/* Mobile navigation */}
					<div className="mt-6 lg:hidden">
						<div className="rounded-2xl border border-slate-200/70 bg-white p-2 shadow-sm">
							<nav className="grid grid-cols-2 gap-1 sm:grid-cols-4">
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
					</div>

					{/* Page content */}
					<div className="mt-8">{children}</div>
				</div>
			</main>
		</div>
	)
}
