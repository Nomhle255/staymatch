import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get('staymatch_token')?.value
		const payload = token ? verifyToken(token) : null

		if (!payload) {
			return NextResponse.json({ error: 'You must be logged in to do that.' }, { status: 401 })
		}

		if (payload.role !== 'LANDLORD') {
			return NextResponse.json({ error: 'Only landlords can view their listings.' }, { status: 403 })
		}

		const accommodations = await prisma.accommodation.findMany({
			where: { landlordId: payload.userId },
			orderBy: { createdAt: 'desc' },
			include: {
				_count: { select: { applications: true } },
			},
		})

		return NextResponse.json({ accommodations })
	} catch (error) {
		console.error('List accommodations error:', error)
		return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
	}
}