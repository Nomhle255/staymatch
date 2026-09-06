import type { ReactNode, ComponentType } from 'react'
import {
	LayoutDashboard,
	Search,
	FileText,
	LogOut,
	MapPin,
	BadgeCheck,
	Wallet,
	BedDouble,
	Pencil,
	ChevronRight,
} from 'lucide-react'

const navItems = [
	{ label: 'Dashboard', icon: LayoutDashboard, active: true, href: '#student-dashboard'},
	{ label: 'Browse Listings', icon: Search, active: false, href: '#student-browse-listings' },
	{ label: 'Applications', icon: FileText, active: false, href: '#applications'  },
]

const stats = [
	{ label: 'Applications', value: '3', icon: FileText, tint: 'bg-blue-50 text-blue-600' },
]

const preferences = [
	{ label: 'Budget', value: 'M600 – M1,000', icon: Wallet },
	{ label: 'Preferred Area', value: 'Ha Abia, Maseru', icon: MapPin },
	{ label: 'Room Type', value: 'Single room', icon: BedDouble },
]

const matches = [
	{
		title: 'Single room',
		area: 'Khubelu',
		price: 'M600 / month',
		match: '96% match',
		gradient: 'from-blue-400 to-indigo-500',
	},
	{
		title: 'Shared 2-bedroom',
		area: 'Ha Abia, Ha Joele',
		price: 'M600 / month',
		match: '91% match',
		gradient: 'from-sky-400 to-blue-500',
	},
	{
		title: 'Two room',
		area: 'Ha Abia, Tsieng',
		price: 'M800 / month',
		match: '88% match',
		verified: false,
		gradient: 'from-violet-400 to-purple-500',
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
	return (
		<button
			type="button"
			onClick={() => {
				window.location.hash = href
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

function StatCard({ label, value, icon: Icon, tint }: { label: string; value: string; icon: ComponentType<{ className?: string }>; tint: string }) {
	return (
		<div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
			<div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}>
				<Icon className="h-5 w-5" />
			</div>
			<p className="mt-4 text-2xl font-black tracking-[-0.03em] text-slate-950">{value}</p>
			<p className="mt-1 text-sm text-slate-500">{label}</p>
		</div>
	)
}

function SidebarShell({ children }: { children: ReactNode }) {
	return (
		<aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-200/70 bg-white px-4 py-6 lg:flex">
			{children}
		</aside>
	)
}

function StudentDashboard() {
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
						<h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">
							Welcome back, Nomhle
						</h1>
						<p className="mt-1 text-sm text-slate-500">Here's what's new with your housing search.</p>
					</div>
					<div className="flex items-center gap-3">
						<button
							type="button"
							className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
						>
							Browse Listings
						</button>
					</div>
				</div>

				<div className="mt-6 grid gap-4 sm:grid-cols-2">
					{stats.map((stat) => (
						<StatCard key={stat.label} {...stat} />
					))}
				</div>

				<div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
					<div className="space-y-6">
						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">Recommended for you</h2>
								<a href="#student-browse-listings" className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
									View all
									<ChevronRight className="h-4 w-4" />
								</a>
							</div>

							<div className="mt-5 space-y-4">
								{matches.map((listing) => (
									<div
										key={listing.title}
										className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 p-4 transition hover:border-blue-200 hover:shadow-md sm:flex-row sm:items-center"
									>
										<div className={`h-24 w-full shrink-0 rounded-xl bg-gradient-to-br sm:w-32 ${listing.gradient}`} />
										<div className="flex-1">
											<div className="flex flex-wrap items-center gap-2">
												<h3 className="text-base font-bold text-slate-950">{listing.title}</h3>
												{listing.verified && (
													<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
														<BadgeCheck className="h-3 w-3" />
														Verified
													</span>
												)}
											</div>
											<p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
												<MapPin className="h-3.5 w-3.5" />
												{listing.area}
											</p>
											<div className="mt-2 flex items-center gap-3">
												<span className="text-sm font-bold text-slate-900">{listing.price}</span>
												<span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
													{listing.match}
												</span>
											</div>
										</div>
										<button
											type="button"
											className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
										>
											View details
										</button>
									</div>
								))}
							</div>
						</section>
					</div>

					<div className="space-y-6">
						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">Your search profile</h2>
								<button type="button" className="text-slate-400 transition hover:text-blue-600" aria-label="Edit preferences">
									<Pencil className="h-4 w-4" />
								</button>
							</div>
							<div className="mt-4 space-y-3">
								{preferences.map((pref) => (
									<div key={pref.label} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
										<pref.icon className="h-4 w-4 shrink-0 text-blue-600" />
										<div>
											<p className="text-xs font-medium text-slate-500">{pref.label}</p>
											<p className="text-sm font-semibold text-slate-900">{pref.value}</p>
										</div>
									</div>
								))}
							</div>
						</section>
					</div>
				</div>
			</main>
		</div>
	)
}

export default StudentDashboard