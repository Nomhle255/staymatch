import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get('staymatch_token')?.value
		const payload = token ? verifyToken(token) : null

		if (!payload) {
			return NextResponse.json(
				{ error: 'You must be logged in to do that.' },
				{ status: 401 },
			)
		}

		if (payload.role !== 'ADMINISTRATOR') {
			return NextResponse.json(
				{ error: 'Only administrators can view landlords.' },
				{ status: 403 },
			)
		}

		// Never select passwordHash
		const landlords = await prisma.user.findMany({
			where: { role: 'LANDLORD' },
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				name: true,
				email: true,
				phone: true,
				createdAt: true,
				_count: {
					select: { accommodations: true },
				},
			},
		})

		return NextResponse.json({
			landlords: landlords.map((landlord) => ({
				id: landlord.id,
				name: landlord.name,
				email: landlord.email,
				phone: landlord.phone,
				createdAt: landlord.createdAt,
				accommodationCount: landlord._count.accommodations,
			})),
		})
	} catch (error) {
		console.error('Admin fetch landlords error:', error)

		return NextResponse.json(
			{ error: 'Something went wrong. Please try again.' },
			{ status: 500 },
		)
	}
}