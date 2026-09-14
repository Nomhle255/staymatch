import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

const VALID_PROPERTY_TYPES = [
	'SINGLE_ROOM',
	'DOUBLE',
	'BACHELOR',
	'COMMUNE',
]

type RouteContext = {
	params: Promise<{ id: string }>
}

export async function GET(
	request: NextRequest,
	{ params }: RouteContext,
) {
	try {
		const { id } = await params

		const token = request.cookies.get('staymatch_token')?.value
		const payload = token ? verifyToken(token) : null

		if (!payload) {
			return NextResponse.json(
				{ error: 'You must be logged in to do that.' },
				{ status: 401 },
			)
		}

		const accommodation = await prisma.accommodation.findUnique({
			where: { id },
		})

		if (!accommodation) {
			return NextResponse.json(
				{ error: 'Accommodation not found.' },
				{ status: 404 },
			)
		}

		if (
			payload.role === 'LANDLORD' &&
			accommodation.landlordId !== payload.userId
		) {
			return NextResponse.json(
				{ error: 'You do not have access to this listing.' },
				{ status: 403 },
			)
		}

		return NextResponse.json({ accommodation })
	} catch (error) {
		console.error('Fetch accommodation error:', error)

		return NextResponse.json(
			{ error: 'Something went wrong. Please try again.' },
			{ status: 500 },
		)
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: RouteContext,
) {
	try {
		const { id } = await params

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
				{ error: 'Only landlords can delete listings.' },
				{ status: 403 },
			)
		}

		const existing = await prisma.accommodation.findUnique({
			where: { id },
		})

		if (!existing) {
			return NextResponse.json(
				{ error: 'Accommodation not found.' },
				{ status: 404 },
			)
		}

		if (existing.landlordId !== payload.userId) {
			return NextResponse.json(
				{ error: 'You do not have access to this listing.' },
				{ status: 403 },
			)
		}

		await prisma.accommodation.delete({
			where: { id },
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Delete accommodation error:', error)

		return NextResponse.json(
			{ error: 'Something went wrong. Please try again.' },
			{ status: 500 },
		)
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: RouteContext,
) {
	try {
		const { id } = await params

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
				{ error: 'Only landlords can edit listings.' },
				{ status: 403 },
			)
		}

		const existing = await prisma.accommodation.findUnique({
			where: { id },
		})

		if (!existing) {
			return NextResponse.json(
				{ error: 'Accommodation not found.' },
				{ status: 404 },
			)
		}

		if (existing.landlordId !== payload.userId) {
			return NextResponse.json(
				{ error: 'You do not have access to this listing.' },
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

		if (!propertyType || !price || !area || !description) {
			return NextResponse.json(
				{
					error:
						'Please fill in the property type, rent, area, and description.',
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

		if (
			typeof latitude !== 'number' ||
			typeof longitude !== 'number'
		) {
			return NextResponse.json(
				{
					error:
						'Please select and confirm the property location on the map.',
				},
				{ status: 400 },
			)
		}

		const accommodation = await prisma.accommodation.update({
			where: { id },
			data: {
				description,
				area,
				price: Number(price),
				propertyType,
				amenities: Array.isArray(amenities) ? amenities : [],
				latitude,
				longitude,
				availableFrom: availableFrom
					? new Date(availableFrom)
					: null,
			},
		})

		return NextResponse.json({ accommodation })
	} catch (error) {
		console.error('Update accommodation error:', error)

		return NextResponse.json(
			{ error: 'Something went wrong. Please try again.' },
			{ status: 500 },
		)
	}
}