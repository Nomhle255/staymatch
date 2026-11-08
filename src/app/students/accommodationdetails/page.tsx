import { Suspense } from 'react'
import StudentAccommodationDetails from '@/components/pages/StudentAccommodationDetails'

export default function StudentAccommodationDetailsPage() {
	return (
		<Suspense fallback={null}>
			<StudentAccommodationDetails />
		</Suspense>
	)
}