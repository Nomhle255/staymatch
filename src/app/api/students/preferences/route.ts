import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

const validPropertyTypes = [
	'SINGLE_ROOM',
	'DOUBLE',
	'COMMUNE',
	'BACHELOR',
] as const

const validMinMatches = [0, 50, 70, 90]

function getStudentId(request: NextRequest) {
	const token = request.cookies.get('staymatch_token')?.value

	if (!token) {
		return null
	}

	const payload = verifyToken(token)

	if (!payload || !payload.userId) {
		return null
	}

	return payload.userId
}

export async function GET(request: NextRequest) {
	try {
		const studentId = getStudentId(request)

		if (!studentId) {
			return NextResponse.json(
				{ error: 'You must be logged in.' },
				{ status: 401 },
			)
		}

		const preference =
			await prisma.studentPreference.findUnique({
				where: {
					studentId,
				},
			})

		return NextResponse.json({
			preference,
		})
	} catch (error) {
		console.error(
			'Fetch student preferences error:',
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

export async function PUT(request: NextRequest) {
	try {
		const studentId = getStudentId(request)

		if (!studentId) {
			return NextResponse.json(
				{ error: 'You must be logged in.' },
				{ status: 401 },
			)
		}

		const student = await prisma.user.findUnique({
			where: {
				id: studentId,
			},
			select: {
				id: true,
				role: true,
			},
		})

		if (!student) {
			return NextResponse.json(
				{ error: 'Student account not found.' },
				{ status: 404 },
			)
		}

		if (student.role !== 'STUDENT') {
			return NextResponse.json(
				{
					error:
						'Only students can save preferences.',
				},
				{ status: 403 },
			)
		}

		const body = await request.json()

		const {
			universityId,
			propertyType,
			priceRange,
			maxDistance,
			ratings,
			minMatch,
		} = body

		// Validate universityId
		if (
			universityId !== null &&
			universityId !== undefined &&
			(!Number.isInteger(universityId) ||
				universityId <= 0)
		) {
			return NextResponse.json(
				{ error: 'Invalid university ID.' },
				{ status: 400 },
			)
		}

		// Validate property type
		if (
			propertyType !== null &&
			propertyType !== undefined &&
			!validPropertyTypes.includes(propertyType)
		) {
			return NextResponse.json(
				{ error: 'Invalid property type.' },
				{ status: 400 },
			)
		}

		// Validate price range
		if (
			typeof priceRange !== 'string' ||
			priceRange.trim() === ''
		) {
			return NextResponse.json(
				{ error: 'Price range is required.' },
				{ status: 400 },
			)
		}

		// Validate maximum distance
		if (
			typeof maxDistance !== 'number' ||
			!Number.isFinite(maxDistance) ||
			maxDistance < 0
		) {
			return NextResponse.json(
				{ error: 'Invalid maximum distance.' },
				{ status: 400 },
			)
		}

		// Validate ratings
		if (
			!ratings ||
			typeof ratings !== 'object' ||
			Array.isArray(ratings)
		) {
			return NextResponse.json(
				{ error: 'Invalid preference ratings.' },
				{ status: 400 },
			)
		}

		for (const value of Object.values(ratings)) {
			if (
				typeof value !== 'number' ||
				!Number.isInteger(value) ||
				value < 0 ||
				value > 5
			) {
				return NextResponse.json(
					{
						error:
							'Preference ratings must be between 0 and 5.',
					},
					{ status: 400 },
				)
			}
		}

		// Validate minimum match
		if (!validMinMatches.includes(minMatch)) {
			return NextResponse.json(
				{
					error:
						'Invalid minimum match percentage.',
				},
				{ status: 400 },
			)
		}

		// Validate selected university
		if (universityId !== null && universityId !== undefined) {
			const university =
				await prisma.university.findUnique({
					where: {
						id: universityId,
					},
				})

			if (!university) {
				return NextResponse.json(
					{
						error:
							'Selected university was not found.',
					},
					{ status: 400 },
				)
			}
		}

		// Create or update preferences
		const preference =
			await prisma.studentPreference.upsert({
				where: {
					studentId,
				},
				create: {
					studentId,
					universityId:
						universityId ?? null,
					propertyType:
						propertyType ?? null,
					priceRange,
					maxDistance,
					ratings,
					minMatch,
				},
				update: {
					universityId:
						universityId ?? null,
					propertyType:
						propertyType ?? null,
					priceRange,
					maxDistance,
					ratings,
					minMatch,
				},
			})

		return NextResponse.json({
			message:
				'Preferences saved successfully.',
			preference,
		})
	} catch (error) {
		console.error(
			'Save student preferences error:',
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