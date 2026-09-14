import { Suspense } from 'react'
import EditAccommodation from '@/components/pages/EditAccommodation'

export default function Page() {
	return (
		<Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading...</div>}>
			<EditAccommodation />
		</Suspense>
	)
}