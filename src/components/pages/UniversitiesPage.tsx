'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { University, Plus, MapPin, Globe2 } from 'lucide-react'
import AdminShell from '@/components/pages/AdminShell'

type UniversityType = {
	id: string
	name: string
	latitude: number
	longitude: number
}

function UniversityCard({
	university,
}: {
	university: UniversityType
}) {
	return (
		<div className="min-w-0 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:p-5">
			<div className="flex items-start justify-between gap-3 sm:gap-4">
				<div className="flex min-w-0 items-center gap-3 sm:gap-4">
					<div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
						<University className="h-5 w-5" />
					</div>

					<div className="min-w-0">
						<h2 className="break-words text-base font-bold text-slate-950">
							{university.name}
						</h2>

						<p className="mt-1 text-xs text-slate-500">
							University location
						</p>
					</div>
				</div>

				<div className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
					Active
				</div>
			</div>

			<div className="mt-5 grid gap-3 sm:grid-cols-2">
				<div className="min-w-0 rounded-xl bg-slate-50 p-3">
					<div className="flex items-center gap-2">
						<MapPin className="h-4 w-4 text-blue-600" />

						<p className="text-xs font-medium text-slate-500">
							Latitude
						</p>
					</div>

					<p className="mt-1 break-all text-sm font-semibold text-slate-900">
						{university.latitude}
					</p>
				</div>

				<div className="min-w-0 rounded-xl bg-slate-50 p-3">
					<div className="flex items-center gap-2">
						<Globe2 className="h-4 w-4 text-blue-600" />

						<p className="text-xs font-medium text-slate-500">
							Longitude
						</p>
					</div>

					<p className="mt-1 break-all text-sm font-semibold text-slate-900">
						{university.longitude}
					</p>
				</div>
			</div>
		</div>
	)
}

export default function UniversitiesPage() {
	const router = useRouter()

	const [universities, setUniversities] = useState<
		UniversityType[]
	>([])

	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		fetchUniversities()
	}, [])

	async function fetchUniversities() {
		try {
			setLoading(true)
			setError('')

			const response = await fetch('/api/universities')

			if (!response.ok) {
				throw new Error('Failed to load universities.')
			}

			const data = await response.json()

			setUniversities(data)
		} catch (error) {
			console.error('Failed to fetch universities:', error)

			setError(
				error instanceof Error
					? error.message
					: 'Failed to load universities.'
			)
		} finally {
			setLoading(false)
		}
	}

	function goToAdd() {
		router.push('/admin/universities/add')
	}

	return (
		<AdminShell
			active="universities"
			title="Manage Universities"
			subtitle="Manage universities used for accommodation distance calculations."
		>
			{/* Count and add button */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">
						Universities
					</h2>

					<p className="mt-1 text-sm text-slate-500">
						{universities.length}{' '}
						{universities.length === 1
							? 'university'
							: 'universities'}{' '}
						registered.
					</p>
				</div>

				<button
					type="button"
					onClick={goToAdd}
					className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 sm:w-auto"
				>
					<Plus className="h-4 w-4" />
					Add University
				</button>
			</div>

			{loading && (
				<div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center sm:p-10">
					<p className="text-sm font-semibold text-slate-600">
						Loading universities...
					</p>
				</div>
			)}

			{error && !loading && (
				<div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center sm:p-6">
					<p className="text-sm font-semibold text-rose-700">
						{error}
					</p>

					<button
						type="button"
						onClick={fetchUniversities}
						className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
					>
						Try Again
					</button>
				</div>
			)}

			{!loading && !error && universities.length === 0 && (
				<div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center sm:p-10">
					<div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600">
						<University className="h-6 w-6" />
					</div>

					<h3 className="mt-4 text-base font-bold text-slate-950">
						No universities yet
					</h3>

					<p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
						Add a university so StayMatch can use its stored
						coordinates when calculating accommodation
						distances.
					</p>

					<button
						type="button"
						onClick={goToAdd}
						className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 sm:w-auto"
					>
						<Plus className="h-4 w-4" />
						Add University
					</button>
				</div>
			)}

			{!loading && !error && universities.length > 0 && (
				<div className="mt-6 grid gap-4 md:grid-cols-2">
					{universities.map((university) => (
						<UniversityCard
							key={university.id}
							university={university}
						/>
					))}
				</div>
			)}
		</AdminShell>
	)
}