'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
    ArrowLeft,
    Edit,
    MapPin,
    Home,
    Calendar,
    DollarSign,
    CheckCircle,
} from 'lucide-react'

type Accommodation = {
    id: string
    description: string
    area: string
    price: number
    propertyType: string
    amenities: string[]
    availableFrom: string | null
    status: string
    latitude: number
    longitude: number
    createdAt: string
    updatedAt: string
}

const propertyTypeLabels: Record<string, string> = {
    SINGLE_ROOM: 'Single Room',
    DOUBLE: 'Double',
    COMMUNE: 'Commune',
    BACHELOR: 'Bachelor',
}

const statusLabels: Record<string, string> = {
    PENDING_REVIEW: 'Pending Review',
    VERIFIED: 'Verified',
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
}

export default function AccommodationDetails() {
    const searchParams = useSearchParams()

    const accommodationId = searchParams.get('id')

    const [accommodation, setAccommodation] =
        useState<Accommodation | null>(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchAccommodation = async () => {
            if (!accommodationId) {
                setError('Accommodation ID is missing')
                setLoading(false)
                return
            }

            try {
                const response = await fetch(
                    `/api/accommodationlistings/${accommodationId}`
                )

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(
                        data.error ||
                            'Failed to load accommodation'
                    )
                }

                setAccommodation(data.accommodation)
            } catch (error) {
                console.error(error)

                setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to load accommodation'
                )
            } finally {
                setLoading(false)
            }
        }

        fetchAccommodation()
    }, [accommodationId])

    if (loading) {
        return (
            <div className="p-8">
                <p className="text-slate-500">
                    Loading accommodation...
                </p>
            </div>
        )
    }

    if (error || !accommodation) {
        return (
            <div className="p-8">
                <Link
                    href="/landlord/accommodationlisting"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft size={18} />
                    Back to My Listings
                </Link>

                <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                    <p className="text-red-600">
                        {error || 'Accommodation not found'}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="mx-auto max-w-5xl">

                <Link
                    href="/landlord/accommodationlisting"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft size={18} />
                    Back to My Listings
                </Link>

                <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Accommodation Details
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            View the complete information for this
                            accommodation.
                        </p>
                    </div>

                    <Link
                        href={`/landlord/accommodationlisting/edit?id=${accommodationId}`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
                    >
                        <Edit size={17} />
                        Edit Accommodation
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-2">

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold text-slate-900">
                            Property Information
                        </h2>

                        <div className="space-y-5">

                            <div className="flex items-start gap-3">
                                <Home
                                    size={20}
                                    className="mt-0.5 text-slate-500"
                                />

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Property Type
                                    </p>

                                    <p className="font-medium text-slate-900">
                                        {propertyTypeLabels[
                                            accommodation.propertyType
                                        ] ||
                                            accommodation.propertyType}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin
                                    size={20}
                                    className="mt-0.5 text-slate-500"
                                />

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Area
                                    </p>

                                    <p className="font-medium text-slate-900">
                                        {accommodation.area}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <DollarSign
                                    size={20}
                                    className="mt-0.5 text-slate-500"
                                />

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Monthly Rent
                                    </p>

                                    <p className="font-medium text-slate-900">
                                        M
                                        {accommodation.price.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar
                                    size={20}
                                    className="mt-0.5 text-slate-500"
                                />

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Available From
                                    </p>

                                    <p className="font-medium text-slate-900">
                                        {accommodation.availableFrom
                                            ? new Date(
                                                    accommodation.availableFrom
                                                ).toLocaleDateString()
                                            : 'Not specified'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CheckCircle
                                    size={20}
                                    className="mt-0.5 text-slate-500"
                                />

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Status
                                    </p>

                                    <p className="font-medium text-slate-900">
                                        {statusLabels[
                                            accommodation.status
                                        ] ||
                                            accommodation.status}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold text-slate-900">
                            Accommodation Details
                        </h2>

                        <div className="mb-6">
                            <p className="mb-2 text-xs text-slate-400">
                                Description
                            </p>

                            <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                                {accommodation.description}
                            </p>
                        </div>

                        <div>
                            <p className="mb-3 text-xs text-slate-400">
                                Amenities
                            </p>

                            {accommodation.amenities.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {accommodation.amenities.map(
                                        (amenity) => (
                                            <span
                                                key={amenity}
                                                className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
                                            >
                                                {amenity}
                                            </span>
                                        )
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">
                                    No amenities specified.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-lg font-semibold text-slate-900">
                        Property Location
                    </h2>

                    <div className="rounded-lg bg-slate-100 p-6">
                        <div className="flex items-center gap-3">
                            <MapPin
                                size={22}
                                className="text-slate-600"
                            />

                            <div>
                                <p className="font-medium text-slate-900">
                                    {accommodation.area}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Latitude:{' '}
                                    {accommodation.latitude}
                                </p>

                                <p className="text-sm text-slate-500">
                                    Longitude:{' '}
                                    {accommodation.longitude}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}