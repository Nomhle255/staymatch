import { Suspense } from 'react'
import EditAccommodation from '@/components/pages/EditAccommodation'

export default function Page() {
    return (
        <Suspense
            fallback={
                <p className="p-6 text-sm text-slate-500">Loading...</p>
            }
        >
            <EditAccommodation />
        </Suspense>
    )
}