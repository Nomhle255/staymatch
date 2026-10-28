import { Suspense } from 'react'
import AccommodationListings from '@/components/pages/AccommodationListings'

export default function Page() {
	return (
		<Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading...</p>}>
			<AccommodationListings />
		</Suspense>
	)
}