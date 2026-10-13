import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

function getStudentId(request: NextRequest) {
	const token = request.cookies.get('staymatch_token')?.value
	const payload = token ? verifyToken(token) : null

	return payload?.userId ?? null
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

		const notifications = await prisma.notification.findMany({
			where: { studentId },
			include: {
				accommodation: {
					select: {
						id: true,
						area: true,
						propertyType: true,
						price: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
			take: 20,
		})

		return NextResponse.json({
			notifications,
			unreadCount: notifications.filter((notification) => !notification.read).length,
		})
	} catch (error) {
		console.error('Fetch student notifications error:', error)

		return NextResponse.json(
			{ error: 'Something went wrong. Please try again.' },
			{ status: 500 },
		)
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const studentId = getStudentId(request)

		if (!studentId) {
			return NextResponse.json(
				{ error: 'You must be logged in.' },
				{ status: 401 },
			)
		}

		const body = await request.json().catch(() => ({}))

		const where: {
			studentId: string
			read: boolean
			id?: string
			accommodationId?: string
		} = { studentId, read: false }

		if (typeof body.id === 'string') {
			where.id = body.id
		} else if (typeof body.accommodationId === 'string') {
			where.accommodationId = body.accommodationId
		} else if (body.all !== true) {
			return NextResponse.json(
				{ error: 'Specify id, accommodationId, or all.' },
				{ status: 400 },
			)
		}

		await prisma.notification.updateMany({ where, data: { read: true } })

		return NextResponse.json({ message: 'Notifications marked as read.' })
	} catch (error) {
		console.error('Mark notifications read error:', error)

		return NextResponse.json(
			{ error: 'Something went wrong. Please try again.' },
			{ status: 500 },
		)
	}
}
