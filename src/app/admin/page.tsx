'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
	LayoutDashboard,
	University,
	Users,
	Building2,
	ChevronRight,
} from 'lucide-react'
import AdminShell from '@/components/pages/AdminShell'

type AdminOptionProps = {
	title: string
	description: string
	icon: typeof University
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
	const [adminName, setAdminName] = useState('Administrator')

	useEffect(() => {
		async function fetchProfile() {
			try {
				const response = await fetch('/api/profile')

				if (!response.ok) {
					return
				}

				const data = await response.json()

				if (data.user?.name) {
					setAdminName(data.user.name)
				}
			} catch (error) {
				console.error(
					'Failed to fetch admin profile:',
					error,
				)
			}
		}

		fetchProfile()
	}, [])

	return (
		<AdminShell
			active="dashboard"
			adminName={adminName}
			title={`Welcome back, ${adminName}`}
			subtitle="Manage the StayMatch system from here."
		>
			<div>
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
							Use the management sections to maintain
							universities, landlords, and accommodation
							listings in StayMatch.
						</p>
					</div>
				</div>
			</div>
		</AdminShell>
	)
}