import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
	try {
		const accommodations = await prisma.accommodation.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        })

		return NextResponse.json({ accommodations })
	} catch (error) {
		console.error('Fetch accommodations error:', error)

		return NextResponse.json(
			{
				error: 'Something went wrong. Please try again.',
			},
			{
				status: 500,
			},
		)
	}
}