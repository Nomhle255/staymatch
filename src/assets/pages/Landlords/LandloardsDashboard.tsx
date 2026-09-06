import type { ReactNode, ComponentType } from 'react'
import {
	LayoutDashboard,
	Home,
	PlusCircle,
	Users,
	LogOut,
	MapPin,
	MoreVertical,
	CheckCircle2,
	XCircle,
} from 'lucide-react'

const navItems = [
	{ label: 'Dashboard', icon: LayoutDashboard, active: true, href: '#landlord-dashboard' },
	{ label: 'My Listings', icon: Home, active: false, href: '#accommodation-listings' },
	{ label: 'Applications', icon: Users, active: false, href: '#applications' },
]

const stats = [
	{ label: 'Active Listings', value: '8', icon: Home, tint: 'bg-blue-50 text-blue-600' },
	{ label: 'Pending Applications', value: '5', icon: Users, tint: 'bg-amber-50 text-amber-600' },
]

const listings = [
	{
		title: 'Single room',
		area: 'Khubelu',
		price: 'M600 / month',
		applicants: 5,
		gradient: 'from-blue-400 to-indigo-500',
	},
	{
		title: 'Shared 2-bedroom',
		area: 'Ha Abia, Ha Joele',
		price: 'M600 / month',
		applicants: 2,
		gradient: 'from-emerald-400 to-teal-500',
	},
	{
		title: 'Two room',
		area: 'Ha Abia, Tsieng',
		price: 'M800 / month',
		applicants: 8,
		gradient: 'from-orange-400 to-rose-500',
	},
]

const applications = [
	{ name: 'Meme Cathala', listing: 'Two room', date: 'Applied Sep 5' },
	{ name: 'Nonko Cathala', listing: 'Single room', date: 'Applied Sep 5' },
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
function StatCard({
	label,
	value,
	icon: Icon,
	tint,
}: {
	label: string
	value: string
	icon: ComponentType<{ className?: string }>
	tint: string
}) {
	return (
		<div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
			<div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}>
				<Icon className="h-5 w-5" />
			</div>

			<p className="mt-4 text-2xl font-black tracking-[-0.03em] text-slate-950">
				{value}
			</p>

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

function LandlordDashboard() {

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
							<div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
								K
							</div>

							<div>
								<p className="text-sm font-bold text-slate-900">
									Khaya Cathala
								</p>

								<p className="text-xs text-slate-500">Landlord</p>
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
							Welcome back, Khaya
						</h1>

						<p className="mt-1 text-sm text-slate-500">
							Here's how your listings are performing.
						</p>
					</div>

					<div className="flex items-center gap-3">

						<button
                            type="button"
                            onClick={() => {
                                window.location.hash = 'add-accommodation'
                            }}
                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
                        >
                            <PlusCircle className="h-4 w-4" />
                            Add Listing
                        </button>
					</div>
				</div>

				<div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{stats.map((stat) => (
						<StatCard key={stat.label} {...stat} />
					))}
				</div>

				<div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
					<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">
								Your listings
							</h2>

							<a
								href="#"
								className="text-sm font-semibold text-blue-600 hover:text-blue-700"
							>
								Manage all
							</a>
						</div>

						<div className="mt-5 space-y-4">
							{listings.map((listing) => (
								<div
									key={listing.title}
									className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 p-4 transition hover:border-blue-200 hover:shadow-md sm:flex-row sm:items-center"
								>
									<div
										className={`h-24 w-full shrink-0 rounded-xl bg-gradient-to-br sm:w-32 ${listing.gradient}`}
									/>

									<div className="flex-1">
										<div className="flex flex-wrap items-center gap-2">
											<h3 className="text-base font-bold text-slate-950">
												{listing.title}
											</h3>
										</div>

										<p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
											<MapPin className="h-3.5 w-3.5" />
											{listing.area}
										</p>

										<div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
											<span className="font-bold text-slate-900">
												{listing.price}
											</span>

											<span className="flex items-center gap-1 text-slate-500">
												<Users className="h-3.5 w-3.5" />
												{listing.applicants} applicants
											</span>
										</div>
									</div>

									<button
										type="button"
										className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
										aria-label="More options"
									>
										<MoreVertical className="h-4 w-4" />
									</button>
								</div>
							))}
						</div>
					</section>

					<div className="space-y-6">
						<section className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-sm">
							<h2 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">
								New applications
							</h2>

							<div className="mt-4 space-y-3">
								{applications.map((application) => (
									<div
										key={application.name}
										className="rounded-xl border border-slate-200/70 p-4"
									>
										<p className="text-sm font-bold text-slate-900">
											{application.name}
										</p>

										<p className="mt-0.5 text-xs font-medium text-blue-600">
											{application.listing}
										</p>

										<p className="mt-1 text-xs text-slate-500">
											{application.date}
										</p>

										<div className="mt-3 flex gap-2">
											<button
												type="button"
												className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-600 transition hover:bg-emerald-100"
											>
												<CheckCircle2 className="h-3.5 w-3.5" />
												Approve
											</button>

											<button
												type="button"
												className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
											>
												<XCircle className="h-3.5 w-3.5" />
												Decline
											</button>
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

export default LandlordDashboard