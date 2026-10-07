import { Suspense } from 'react'
import StudentAccommodationDetails from '@/components/pages/StudentAccommodationDetails'

export default function StudentAccommodationDetailsPage() {
	return (
		// useSearchParams needs a Suspense boundary in the App Router
		<Suspense fallback={null}>
			<StudentAccommodationDetails />
		</Suspense>
	)
}