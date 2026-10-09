import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { sendBrowserPush, type PushSubscriptionPayload } from '@/lib/webPush'

function getStudentId(request: NextRequest) {
	const token = request.cookies.get('staymatch_token')?.value
	const payload = token ? verifyToken(token) : null

	return payload?.userId ?? null
}

export async function POST(request: NextRequest) {
	try {
		const studentId = getStudentId(request)

		if (!studentId) {
			return NextResponse.json(
				{ error: 'You must be logged in.' },
				{ status: 401 },
			)
		}

		const body = (await request.json()) as PushSubscriptionPayload

		if (
			typeof body.endpoint !== 'string' ||
			typeof body.keys?.p256dh !== 'string' ||
			typeof body.keys?.auth !== 'string'
		) {
			return NextResponse.json(
				{ error: 'Invalid push subscription.' },
				{ status: 400 },
			)
		}

		const subscription = await prisma.pushSubscription.upsert({
			where: { endpoint: body.endpoint },
			create: {
				studentId,
				endpoint: body.endpoint,
				p256dh: body.keys.p256dh,
				auth: body.keys.auth,
			},
			update: {
				studentId,
				p256dh: body.keys.p256dh,
				auth: body.keys.auth,
			},
		})

		const unreadNotifications = await prisma.notification.findMany({
			where: { studentId, read: false },
			orderBy: { createdAt: 'desc' },
			take: 5,
			select: {
				title: true,
				message: true,
				accommodationId: true,
			},
		})

		for (const notification of unreadNotifications) {
			const result = await sendBrowserPush(
				{
					endpoint: subscription.endpoint,
					keys: {
						p256dh: subscription.p256dh,
						auth: subscription.auth,
					},
				},
				notification,
			)

			if (result.statusCode === 404 || result.statusCode === 410) {
				await prisma.pushSubscription.delete({
					where: { endpoint: subscription.endpoint },
				})
				break
			}
		}

		return NextResponse.json(
			{
				subscriptionId: subscription.id,
				catchUpCount: unreadNotifications.length,
			},
			{ status: 201 },
		)
	} catch (error) {
		console.error('Save push subscription error:', error)

		return NextResponse.json(
			{ error: 'Could not save push notification settings.' },
			{ status: 500 },
		)
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const studentId = getStudentId(request)

		if (!studentId) {
			return NextResponse.json(
				{ error: 'You must be logged in.' },
				{ status: 401 },
			)
		}

		const body = (await request.json()) as { endpoint?: string }

		if (body.endpoint) {
			await prisma.pushSubscription.deleteMany({
				where: { studentId, endpoint: body.endpoint },
			})
		} else {
			await prisma.pushSubscription.deleteMany({ where: { studentId } })
		}

		return NextResponse.json({ message: 'Push notifications disabled.' })
	} catch (error) {
		console.error('Delete push subscription error:', error)

		return NextResponse.json(
			{ error: 'Could not disable push notifications.' },
			{ status: 500 },
		)
	}
}
