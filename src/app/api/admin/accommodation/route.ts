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
				{ error: 'Only administrators can view all accommodations.' },
				{ status: 403 },
			)
		}

		const accommodations = await prisma.accommodation.findMany({
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				roomIdentifier: true,
				area: true,
				price: true,
				propertyType: true,
				status: true,
				photos: true,
				availableFrom: true,
				createdAt: true,
				landlordId: true,
				landlord: {
					select: {
						name: true,
						email: true,
						phone: true,
					},
				},
				_count: {
					select: { applications: true },
				},
			},
		})

		return NextResponse.json({
			accommodations: accommodations.map((accommodation) => ({
				id: accommodation.id,
				roomIdentifier: accommodation.roomIdentifier,
				area: accommodation.area,
				price: accommodation.price,
				propertyType: accommodation.propertyType,
				status: accommodation.status,
				availableFrom: accommodation.availableFrom,
				createdAt: accommodation.createdAt,
				landlordId: accommodation.landlordId,
				landlordName: accommodation.landlord.name,
				landlordEmail: accommodation.landlord.email,
				landlordPhone: accommodation.landlord.phone,
				// Only send the first photo to keep the response small
				photo: accommodation.photos[0] ?? null,
				photoCount: accommodation.photos.length,
				applicationCount: accommodation._count.applications,
			})),
		})
	} catch (error) {
		console.error('Admin fetch accommodations error:', error)

		return NextResponse.json(
			{ error: 'Something went wrong. Please try again.' },
			{ status: 500 },
		)
	}
}