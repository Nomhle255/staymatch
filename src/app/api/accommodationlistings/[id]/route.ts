import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params

		const token = request.cookies.get('staymatch_token')?.value
		const payload = token ? verifyToken(token) : null

		if (!payload) {
			return NextResponse.json({ error: 'You must be logged in to do that.' }, { status: 401 })
		}

		const accommodation = await prisma.accommodation.findUnique({
			where: { id },
		})

		if (!accommodation) {
			return NextResponse.json({ error: 'Accommodation not found.' }, { status: 404 })
		}

		if (payload.role === 'LANDLORD' && accommodation.landlordId !== payload.userId) {
			return NextResponse.json({ error: 'You do not have access to this listing.' }, { status: 403 })
		}

		return NextResponse.json({ accommodation })
	} catch (error) {
		console.error('Fetch accommodation error:', error)
		return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
	}
}