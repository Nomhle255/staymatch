import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

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

		if (payload.role !== 'ADMINISTRATOR') {
			return NextResponse.json(
				{ error: 'Only administrators can view accommodation details.' },
				{ status: 403 },
			)
		}

		const accommodation = await prisma.accommodation.findUnique({
			where: { id },
			include: {
				landlord: {
					select: {
						id: true,
						name: true,
						email: true,
						phone: true,
					},
				},
				_count: {
					select: {
						applications: true,
					},
				},
			},
		})

		if (!accommodation) {
			return NextResponse.json(
				{ error: 'Accommodation not found.' },
				{ status: 404 },
			)
		}

		return NextResponse.json({ accommodation })
	} catch (error) {
		console.error('Admin accommodation details error:', error)

		return NextResponse.json(
			{ error: 'Something went wrong. Please try again.' },
			{ status: 500 },
		)
	}
}