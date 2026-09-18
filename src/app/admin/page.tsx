'use client'

import type { ComponentType, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
	LayoutDashboard,
	University,
	Users,
	Building2,
	LogOut,
	ChevronRight,
} from 'lucide-react'

const navItems = [
	{
		label: 'Dashboard',
		icon: LayoutDashboard,
		active: true,
		href: '/admin',
	},
	{
		label: 'Universities',
		icon: University,
		active: false,
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

type AdminOptionProps = {
	title: string
	description: string
	icon: ComponentType<{ className?: string }>
	iconBackground: string
	iconColor: string
	href: string
}

function AdminOption({
	title,
	description,
	icon: Icon,
	iconBackground,
	iconColor,
	href,
}: AdminOptionProps) {
	const router = useRouter()

	return (
		<button
			type="button"
			onClick={() => router.push(href)}
			className="group flex w-full items-center justify-between rounded-2xl border border-slate-200/70 bg-white p-5 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md"
		>
			<div className="flex items-center gap-4">
				<div
					className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${iconBackground} ${iconColor}`}
				>
					<Icon className="h-5 w-5" />
				</div>

				<div>
					<h2 className="text-base font-bold text-slate-950">
						{title}
					</h2>

					<p className="mt-1 text-sm text-slate-500">
						{description}
					</p>
				</div>
			</div>

			<ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:text-blue-600" />
		</button>
	)
}

export default function AdminDashboard() {
	const router = useRouter()

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
							Stay<span className="text-blue-600">
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
								A
							</div>

							<div>
								<p className="text-sm font-bold text-slate-900">
									Administrator
								</p>

								<p className="text-xs text-slate-500">
									Admin
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
				<div className="mx-auto max-w-6xl">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div>
							<h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">
								Welcome back, Administrator
							</h1>

							<p className="mt-1 text-sm text-slate-500">
								Manage the StayMatch system from
								here.
							</p>
						</div>
					</div>

					<div className="mt-8">
						<h2 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">
							Management
						</h2>

						<p className="mt-1 text-sm text-slate-500">
							Select an area you want to manage.
						</p>
					</div>

					<div className="mt-5 grid gap-4 md:grid-cols-2">
						<AdminOption
							title="Manage Universities"
							description="Add and manage universities and their coordinates used for distance calculations."
							icon={University}
							iconBackground="bg-blue-50"
							iconColor="text-blue-600"
							href="/admin/universities"
						/>

						<AdminOption
							title="Manage Landlords"
							description="View and manage landlords registered on StayMatch."
							icon={Users}
							iconBackground="bg-violet-50"
							iconColor="text-violet-600"
							href="/admin/landlords"
						/>

						<AdminOption
							title="Manage Accommodations"
							description="Review and manage accommodation listings submitted by landlords."
							icon={Building2}
							iconBackground="bg-sky-50"
							iconColor="text-sky-600"
							href="/admin/accommodations"
						/>
					</div>

					<div className="mt-8 rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
						<div className="flex items-start gap-4">
							<div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
								<LayoutDashboard className="h-5 w-5" />
							</div>

							<div>
								<h2 className="text-base font-extrabold text-slate-950">
									Administrator Dashboard
								</h2>

								<p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
									Use the management sections to
									maintain universities, landlords,
									and accommodation listings in
									StayMatch.
								</p>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}