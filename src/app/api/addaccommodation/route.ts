import { after, NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { getAccommodationMatchScore } from '@/lib/accommodationMatching'
import { sendBrowserPush } from '@/lib/webPush'

const VALID_PROPERTY_TYPES = [
	'SINGLE_ROOM',
	'DOUBLE',
	'COMMUNE',
	'BACHELOR',
] as const

const MAX_ROOM_IDENTIFIER_LENGTH = 50

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
			roomIdentifier,
			price,
			area,
			description,
			availableFrom,
			amenities,
			photos,
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

		// Room name / number
		const cleanRoomIdentifier =
			typeof roomIdentifier === 'string' ? roomIdentifier.trim() : ''

		if (!cleanRoomIdentifier) {
			return NextResponse.json(
				{ error: 'Please enter a room name or number.' },
				{ status: 400 },
			)
		}

		if (cleanRoomIdentifier.length > MAX_ROOM_IDENTIFIER_LENGTH) {
			return NextResponse.json(
				{
					error: `Room name or number must be ${MAX_ROOM_IDENTIFIER_LENGTH} characters or fewer.`,
				},
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
				roomIdentifier: cleanRoomIdentifier,
				description,
				area: area || 'Maseru',
				price: Number(price),
				propertyType,
				amenities: Array.isArray(amenities) ? amenities : [],
				photos: Array.isArray(photos) ? photos : [],
				latitude,
				longitude,
				availableFrom: availableFrom
					? new Date(availableFrom)
					: undefined,
				status: 'AVAILABLE',
			},
		})

		try {
			const preferences = await prisma.studentPreference.findMany({
				include: {
					university: {
						select: {
							latitude: true,
							longitude: true,
						},
					},
				},
			})

			const notifications = preferences.flatMap((preference) => {
				const score = getAccommodationMatchScore(
					{
						price: accommodation.price,
						propertyType: accommodation.propertyType,
						amenities: accommodation.amenities,
						status: accommodation.status,
						latitude: accommodation.latitude,
						longitude: accommodation.longitude,
					},
					preference,
				)

				if (score === null) {
					return []
				}

				const propertyLabel = accommodation.propertyType
					.toLowerCase()
					.replace(/_/g, ' ')

				const roomText = accommodation.roomIdentifier
					? ` (${accommodation.roomIdentifier})`
					: ''

				return [
					{
						studentId: preference.studentId,
						accommodationId: accommodation.id,
						title: 'New accommodation match',
						message: `A new ${propertyLabel}${roomText} in ${accommodation.area} matches your saved preferences (${score}% match).`,
					},
				]
			})

			if (notifications.length > 0) {
				await prisma.notification.createMany({
					data: notifications,
					skipDuplicates: true,
				})
			}

			const matchingNotifications = await prisma.notification.findMany({
				where: { accommodationId: accommodation.id },
				select: {
					studentId: true,
					title: true,
					message: true,
				},
			})

			after(async () => {
				await Promise.all(
					matchingNotifications.map(async (notification) => {
						const subscriptions = await prisma.pushSubscription.findMany({
							where: { studentId: notification.studentId },
						})

						await Promise.all(
							subscriptions.map(async (subscription) => {
								const result = await sendBrowserPush(
									{
										endpoint: subscription.endpoint,
										keys: {
											p256dh: subscription.p256dh,
											auth: subscription.auth,
										},
									},
									{
										title: notification.title,
										message: notification.message,
										accommodationId: accommodation.id,
									},
								)

								if (result.statusCode === 404 || result.statusCode === 410) {
									await prisma.pushSubscription.delete({
										where: { endpoint: subscription.endpoint },
									})
								} else if (!result.sent) {
									console.error('Push notification was not sent:', {
										studentId: notification.studentId,
										message: result.message,
										code: result.code,
									})
								}
							}),
						)
					}),
				)
			})
		} catch (notificationError) {
			console.error(
				'Accommodation created, but notifications could not be processed:',
				notificationError,
			)
		}

		return NextResponse.json({ accommodation }, { status: 201 })
	} catch (error) {
		console.error('Create accommodation error:', error)

		return NextResponse.json(
			{
				error: 'Something went wrong. Please try again.',
			},
			{ status: 500 },
		)
	}
}