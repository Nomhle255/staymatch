import { Suspense } from 'react'
import AccommodationDetails from '@/components/pages/AccommodationDetails'

export default function Page() {
    return (
        <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading...</div>}>
            <AccommodationDetails />
        </Suspense>
    )
}