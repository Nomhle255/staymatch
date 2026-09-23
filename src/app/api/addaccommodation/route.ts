import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

const VALID_PROPERTY_TYPES = [
	'SINGLE_ROOM',
	'DOUBLE',
	'COMMUNE',
	'BACHELOR',
] as const

export async function POST(request: NextRequest) {
	try {
		const token = request.cookies.get('staymatch_token')?.value
		const payload = token ? verifyToken(token) : null

		if (!payload) {
			return NextResponse.json(
				{ error: 'You must be logged in to do that.' },
				{ status: 401 },
			)
		}

		if (payload.role !== 'LANDLORD') {
			return NextResponse.json(
				{ error: 'Only landlords can publish listings.' },
				{ status: 403 },
			)
		}

		const body = await request.json()

		const {
			propertyType,
			price,
			area,
			description,
			availableFrom,
			amenities,
			latitude,
			longitude,
		} = body

		// Validate required fields
		if (!propertyType || !price || !description) {
			return NextResponse.json(
				{
					error:
						'Please fill in the property type, rent, and description.',
				},
				{ status: 400 },
			)
		}

		if (!VALID_PROPERTY_TYPES.includes(propertyType)) {
			return NextResponse.json(
				{ error: 'Invalid property type.' },
				{ status: 400 },
			)
		}

		if (typeof latitude !== 'number' || typeof longitude !== 'number') {
			return NextResponse.json(
				{
					error:
						'Please select and confirm the property location on the map.',
				},
				{ status: 400 },
			)
		}

		const accommodation = await prisma.accommodation.create({
			data: {
				landlordId: payload.userId,
				description,
				area: area || 'Maseru',
				price: Number(price),
				propertyType,
				amenities: Array.isArray(amenities)
					? amenities
					: [],
				latitude,
				longitude,
				availableFrom: availableFrom
					? new Date(availableFrom)
					: undefined,
				status: 'PENDING_REVIEW',
			},
		})

		return NextResponse.json(
			{ accommodation },
			{ status: 201 },
		)
	} catch (error) {
		console.error(
			'Create accommodation error:',
			error,
		)

		return NextResponse.json(
			{
				error:
					'Something went wrong. Please try again.',
			},
			{ status: 500 },
		)
	}
}