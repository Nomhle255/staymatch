import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get('staymatch_token')?.value

		if (!token) {
			return NextResponse.json(
				{ error: 'You are not logged in.' },
				{ status: 401 },
			)
		}

		const payload = verifyToken(token)

		if (!payload) {
			return NextResponse.json(
				{ error: 'Invalid or expired session.' },
				{ status: 401 },
			)
		}

		if (payload.role !== 'STUDENT') {
			return NextResponse.json(
				{ error: 'Only students can access this profile.' },
				{ status: 403 },
			)
		}

		const user = await prisma.user.findUnique({
			where: {
				id: payload.userId,
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
			},
		})

		if (!user) {
			return NextResponse.json(
				{ error: 'Student account not found.' },
				{ status: 404 },
			)
		}

		return NextResponse.json({ user })
	} catch (error) {
		console.error('Fetch student profile error:', error)

		return NextResponse.json(
			{ error: 'Something went wrong. Please try again.' },
			{ status: 500 },
		)
	}
}