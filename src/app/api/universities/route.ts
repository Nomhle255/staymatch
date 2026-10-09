import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const universities = await prisma.university.findMany({
            orderBy: {
                name: 'asc',
            },
        })

        return NextResponse.json(universities)
    } catch (error) {
        console.error('Get universities error:', error)

        return NextResponse.json(
            { error: 'Failed to retrieve universities.' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const { name, latitude, longitude } = body

        if (!name || latitude === undefined || longitude === undefined) {
            return NextResponse.json(
                { error: 'Name, latitude and longitude are required.' },
                { status: 400 }
            )
        }

        const university = await prisma.university.create({
            data: {
                name,
                latitude: Number(latitude),
                longitude: Number(longitude),
            },
        })

        return NextResponse.json(university, { status: 201 })
    } catch (error) {
        console.error('Create university error:', error)

        return NextResponse.json(
            { error: 'Failed to create university.' },
            { status: 500 }
        )
    }
}