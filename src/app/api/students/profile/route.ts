import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get('staymatch_token')?.value

		if (!token) {
			return NextResponse.json(
				{ error: 'You must be logged in.' },
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

		const student = await prisma.user.findUnique({
			where: {
				id: payload.userId,
			},
			select: {
				id: true,
				name: true,
				phone: true,
				university: true,
				role: true,
			},
		})

		if (!student) {
			return NextResponse.json(
				{ error: 'Student profile not found.' },
				{ status: 404 },
			)
		}

		if (student.role !== 'STUDENT') {
			return NextResponse.json(
				{ error: 'Only students can access this profile.' },
				{ status: 403 },
			)
		}

		return NextResponse.json({
			user: {
				id: student.id,
				name: student.name,
				phone: student.phone,
				university: student.university,
				role: student.role,
			},
		})
	} catch (error) {
		console.error('Fetch student profile error:', error)

		return NextResponse.json(
			{ error: 'Something went wrong. Please try again.' },
			{ status: 500 },
		)
	}
}