import { useState } from 'react'
import type { ReactNode, ComponentType } from 'react'
import {
	LayoutDashboard,
	Search,
	Heart,
	FileText,
	LogOut,
	Bell,
	MapPin,
	Clock,
	CheckCircle2,
	XCircle,
	Undo2,
	Eye,
} from 'lucide-react'

const navItems = [
	{ label: 'Dashboard', icon: LayoutDashboard, active: false },
	{ label: 'Browse Listings', icon: Search, active: false },
	{ label: 'Saved Homes', icon: Heart, active: false },
	{ label: 'Applications', icon: FileText, active: true },
]

const filterTabs = ['All', 'Under review', 'Approved', 'Declined']

type Application = {
	id: string
	listing: string
	area: string
	price: string
	date: string
	status: 'Under review' | 'Approved' | 'Declined'
	gradient: string
}

const initialApplications: Application[] = [
	{
		id: '1',
		listing: 'Self-contained single near NUL',
		area: 'Roma, Maseru',
		price: 'M2,800 / month',
		date: 'Submitted Aug 28, 2026',
		status: 'Approved',
		gradient: 'from-blue-400 to-indigo-500',
	},
	{
		id: '2',
		listing: 'Studio flat, walking distance',
		area: 'Roma, Maseru',
		price: 'M3,900 / month',
		date: 'Submitted Sep 1, 2026',
		status: 'Under review',
		gradient: 'from-orange-400 to-rose-500',
	},
	{
		id: '3',
		listing: 'Shared 2-bedroom apartment',
		area: 'Ha Abia, Maseru',
		price: 'M3,400 / month',
		date: 'Submitted Aug 20, 2026',
		status: 'Declined',
		gradient: 'from-emerald-400 to-teal-500',
	},
]

const statusStyles: Record<Application['status'], { tint: string; icon: ComponentType<{ className?: string }> }> = {
	'Under review': { tint: 'bg-amber-50 text-amber-600', icon: Clock },
	Approved: { tint: 'bg-emerald-50 text-emerald-600', icon: CheckCircle2 },
	Declined: { tint: 'bg-rose-50 text-rose-600', icon: XCircle },
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

function AccommodationRequests() {
	const [applications, setApplications] = useState<Application[]>(initialApplications)
	const [activeFilter, setActiveFilter] = useState('All')

	const withdrawApplication = (id: string) => {
		setApplications((current) => current.filter((application) => application.id !== id))
	}

	const filteredApplications = applications.filter(
		(application) => activeFilter === 'All' || application.status === activeFilter,
	)

	const underReviewCount = applications.filter((application) => application.status === 'Under review').length

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
							<div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">A</div>
							<div>
								<p className="text-sm font-bold text-slate-900">Nomhle Cathala</p>
								<p className="text-xs text-slate-500">Student</p>
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
						<h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">My Applications</h1>
						<p className="mt-1 text-sm text-slate-500">
							{underReviewCount > 0
								? `${underReviewCount} application${underReviewCount === 1 ? '' : 's'} still under review.`
								: 'No applications waiting on a response.'}
						</p>
					</div>
					<button
						type="button"
						className="relative grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-300 hover:text-blue-600"
						aria-label="Notifications"
					>
						<Bell className="h-4 w-4" />
						<span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500" />
					</button>
				</div>

				<div className="mt-6 flex flex-wrap gap-2">
					{filterTabs.map((tab) => (
						<button
							key={tab}
							type="button"
							onClick={() => setActiveFilter(tab)}
							className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
								activeFilter === tab
									? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
									: 'bg-white text-slate-600 shadow-sm hover:bg-slate-100'
							}`}
						>
							{tab}
							{tab === 'Under review' && underReviewCount > 0 && (
								<span className="ml-1.5 text-xs opacity-80">({underReviewCount})</span>
							)}
						</button>
					))}
				</div>

				<div className="mt-5 space-y-4">
					{filteredApplications.map((application) => {
						const style = statusStyles[application.status]
						const StatusIcon = style.icon
						return (
							<article
								key={application.id}
								className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
							>
								<div className={`h-24 w-full shrink-0 rounded-xl bg-gradient-to-br sm:w-32 ${application.gradient}`} />

								<div className="flex-1">
									<div className="flex flex-wrap items-center gap-2">
										<h3 className="text-base font-bold text-slate-950">{application.listing}</h3>
										<span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.tint}`}>
											<StatusIcon className="h-3 w-3" />
											{application.status}
										</span>
									</div>
									<p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
										<MapPin className="h-3.5 w-3.5" />
										{application.area}
									</p>
									<div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
										<span className="font-bold text-slate-900">{application.price}</span>
										<span className="text-xs text-slate-400">{application.date}</span>
									</div>
								</div>

								<div className="flex shrink-0 gap-2">
									<button
										type="button"
										className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
									>
										<Eye className="h-3.5 w-3.5" />
										View Listing
									</button>
									{application.status === 'Under review' && (
										<button
											type="button"
											onClick={() => withdrawApplication(application.id)}
											className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-500 transition hover:border-rose-300 hover:text-rose-500"
										>
											<Undo2 className="h-3.5 w-3.5" />
											Withdraw
										</button>
									)}
								</div>
							</article>
						)
					})}
				</div>

				{filteredApplications.length === 0 && (
					<div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
						<p className="text-sm font-semibold text-slate-600">No applications here yet.</p>
						<p className="mt-1 text-sm text-slate-400">
							{activeFilter === 'All' ? 'Browse listings to apply for your first home.' : 'Try a different filter.'}
						</p>
					</div>
				)}
			</main>
		</div>
	)
}

export default AccommodationRequests