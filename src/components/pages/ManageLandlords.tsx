'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Mail, Phone, CalendarDays } from 'lucide-react'
import AdminShell from '@/components/pages/AdminShell'

type Landlord = {
	id: string
	name: string
	email: string
	phone: string | null
	createdAt: string
	accommodationCount: number
}

function formatDate(value: string) {
	const date = new Date(value)

	if (Number.isNaN(date.getTime())) return '—'

	return date.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	})
}

function StatCard({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
			<p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
				{label}
			</p>

			<p className="mt-1 text-2xl font-black tracking-[-0.03em] text-slate-950">
				{value}
			</p>
		</div>
	)
}

function AdminLandlords() {
	const [landlords, setLandlords] = useState<Landlord[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [query, setQuery] = useState('')

	useEffect(() => {
		const fetchLandlords = async () => {
			try {
				setLoading(true)
				setError('')

				const response = await fetch('/api/admin/landlords')

				const data = await response.json().catch(() => null)

				if (!response.ok || !data) {
					throw new Error(data?.error || 'Failed to load landlords.')
				}

				setLandlords(data.landlords ?? [])
			} catch (error) {
				console.error('Failed to load landlords:', error)

				setError(
					error instanceof Error
						? error.message
						: 'Something went wrong while loading landlords.',
				)
			} finally {
				setLoading(false)
			}
		}

		fetchLandlords()
	}, [])

	const filteredLandlords = landlords.filter((landlord) => {
		const text = `${landlord.name} ${landlord.email} ${
			landlord.phone ?? ''
		}`.toLowerCase()

		return text.includes(query.toLowerCase().trim())
	})

	const totalListings = landlords.reduce(
		(sum, landlord) => sum + landlord.accommodationCount,
		0,
	)

	const withoutListings = landlords.filter(
		(landlord) => landlord.accommodationCount === 0,
	).length

	return (
		<AdminShell
			active="landlords"
			title="Landlords"
			subtitle="Every landlord registered on StayMatch."
		>
			{!loading && !error && (
				<div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
					<StatCard label="Landlords" value={landlords.length} />
					<StatCard label="Total listings" value={totalListings} />
					<StatCard label="No listings yet" value={withoutListings} />
				</div>
			)}

			{loading && (
				<div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
					<p className="text-sm font-semibold text-slate-600">
						Loading landlords...
					</p>
				</div>
			)}

			{error && !loading && (
				<div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
					<p className="text-sm font-semibold text-rose-700">
						{error}
					</p>

					<button
						type="button"
						onClick={() => window.location.reload()}
						className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
					>
						Try Again
					</button>
				</div>
			)}

			{!loading && !error && (
				<>
					<div className="mt-6 rounded-[1.75rem] border border-slate-200/70 bg-white p-4 shadow-sm sm:p-5">
						<div className="relative">
							<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

							<input
								type="text"
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder="Search by name, email or phone"
								className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
							/>
						</div>
					</div>

					<p className="mt-5 text-sm text-slate-500">
						<span className="font-bold text-slate-950">
							{filteredLandlords.length}
						</span>{' '}
						of {landlords.length} landlords
					</p>

					{filteredLandlords.length === 0 ? (
						<div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
							<p className="text-sm font-semibold text-slate-600">
								No landlords found.
							</p>
						</div>
					) : (
						<div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200/70 bg-white shadow-sm">
							<table className="w-full min-w-[720px] text-left text-sm">
								<thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400">
									<tr>
										<th className="px-5 py-3">Landlord</th>
										<th className="px-5 py-3">Contact</th>
										<th className="px-5 py-3">Joined</th>
										<th className="px-5 py-3">Listings</th>
										<th className="px-5 py-3" />
									</tr>
								</thead>

								<tbody className="divide-y divide-slate-100">
									{filteredLandlords.map((landlord) => (
										<tr
											key={landlord.id}
											className="transition hover:bg-slate-50/70"
										>
											<td className="px-5 py-4">
												<div className="flex items-center gap-3">
													<div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
														{landlord.name
															.charAt(0)
															.toUpperCase()}
													</div>

													<p className="font-bold text-slate-900">
														{landlord.name}
													</p>
												</div>
											</td>

											<td className="px-5 py-4">
												<p className="flex items-center gap-1.5 text-slate-600">
													<Mail className="h-3.5 w-3.5 text-slate-400" />
													{landlord.email}
												</p>

												<p className="mt-1 flex items-center gap-1.5 text-slate-500">
													<Phone className="h-3.5 w-3.5 text-slate-400" />
													{landlord.phone || 'No phone added'}
												</p>
											</td>

											<td className="px-5 py-4 text-slate-600">
												<span className="flex items-center gap-1.5">
													<CalendarDays className="h-3.5 w-3.5 text-slate-400" />
													{formatDate(landlord.createdAt)}
												</span>
											</td>

											<td className="px-5 py-4">
												<span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
													{landlord.accommodationCount}
												</span>
											</td>

											<td className="px-5 py-4 text-right">
												{landlord.accommodationCount > 0 ? (
													<Link
														href={`/admin/accommodations?landlord=${landlord.id}`}
														className="inline-block rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
													>
														View listings
													</Link>
												) : (
													<span className="inline-block rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-400 opacity-60">
														No listings
													</span>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</>
			)}
		</AdminShell>
	)
}

export default AdminLandlords