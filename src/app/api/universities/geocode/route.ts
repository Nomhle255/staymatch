import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'

export async function POST(request: NextRequest) {
    if (!isAdmin(request)) {
        return NextResponse.json(
            { error: 'Unauthorized.' },
            { status: 401 }
        )
    }

    try {
        const body = await request.json()
        const { location } = body

        if (!location) {
            return NextResponse.json(
                { error: 'Location is required.' },
                { status: 400 }
            )
        }

        const params = new URLSearchParams({
            q: location,
            format: 'json',
            limit: '5',
            countrycodes: 'ls',
        })

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?${params.toString()}`,
            {
                headers: {
                    'User-Agent': 'StayMatch/1.0',
                },
            }
        )

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Geocoding service failed.' },
                { status: 502 }
            )
        }

        const results = await response.json()

        return NextResponse.json(results)
    } catch (error) {
        console.error('Geocoding error:', error)

        return NextResponse.json(
            { error: 'Failed to find coordinates.' },
            { status: 500 }
        )
    }
}