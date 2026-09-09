import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PropertyType } from '@prisma/client'

export async function POST(request: Request) {
	try {
		const body = await request.json()

		const {
			landlordId,
			title,
			description,
			area,
			price,
			propertyType,
			bedrooms,
			bathrooms,
			amenities,
			availableFrom,
		} = body

		if (
			!landlordId ||
			!title ||
			!description ||
			!area ||
			price === undefined ||
			!propertyType
		) {
			return NextResponse.json(
				{
					error: 'Please fill in all required fields.',
				},
				{ status: 400 },
			)
		}

		const landlord = await prisma.user.findUnique({
			where: {
				id: landlordId,
			},
		})

		if (!landlord) {
			return NextResponse.json(
				{
					error: 'Landlord account not found.',
				},
				{ status: 404 },
			)
		}

		if (landlord.role !== 'LANDLORD') {
			return NextResponse.json(
				{
					error: 'Only landlords can add accommodation listings.',
				},
				{ status: 403 },
			)
		}

		const accommodation =
			await prisma.accommodation.create({
				data: {
					landlordId,
					title,
					description,
					area,
					price: Number(price),
					propertyType:
						propertyType as PropertyType,
					bedrooms: Number(bedrooms),
					bathrooms: Number(bathrooms),
					amenities: Array.isArray(amenities)
						? amenities
						: [],
					availableFrom: availableFrom
						? new Date(availableFrom)
						: null,
					status: 'PENDING_REVIEW',
				},
			})

		return NextResponse.json(
			{
				message:
					'Accommodation added successfully.',
				accommodation,
			},
			{ status: 201 },
		)
	} catch (error) {
		console.error(
			'Add accommodation error:',
			error,
		)

		return NextResponse.json(
			{
				error: 'Failed to add accommodation.',
			},
			{ status: 500 },
		)
	}
}