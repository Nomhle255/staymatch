import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

const profileSelect = {
	id: true,
	name: true,
	email: true,
	phone: true,
	role: { select: { name: true } },
	university: true,
} as const

// Keep the API response shape the same as before: role is a plain string.
function toProfile<T extends { role: { name: string } }>(user: T) {
	return { ...user, role: user.role.name }
}

function getPayload(request: NextRequest) {
	const token = request.cookies.get('staymatch_token')?.value

	if (!token) {
		return null
	}

	return verifyToken(token)
}

export async function GET(request: NextRequest) {
	try {
		const payload = getPayload(request)

		if (!payload) {
			return NextResponse.json(
				{ error: 'Invalid or expired session. Please log in again.' },
				{ status: 401 },
			)
		}

		const user = await prisma.user.findUnique({
			where: { id: payload.userId },
			select: profileSelect,
		})

		if (!user) {
			return NextResponse.json(
				{ error: 'User account not found.' },
				{ status: 404 },
			)
		}

		return NextResponse.json({ user: toProfile(user) })
	} catch (error) {
		console.error('Fetch profile error:', error)

		return NextResponse.json(
			{ error: 'Something went wrong. Please try again.' },
			{ status: 500 },
		)
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const payload = getPayload(request)

		if (!payload) {
			return NextResponse.json(
				{ error: 'You must be logged in to update your profile.' },
				{ status: 401 },
			)
		}

		const existing = await prisma.user.findUnique({
			where: { id: payload.userId },
			select: { id: true, role: { select: { name: true } } },
		})

		if (!existing) {
			return NextResponse.json(
				{ error: 'Account not found.' },
				{ status: 404 },
			)
		}

		let body: { name?: unknown; phone?: unknown; email?: unknown }

		try {
			body = await request.json()
		} catch {
			return NextResponse.json(
				{ error: 'Please provide valid JSON.' },
				{ status: 400 },
			)
		}

		const { name, phone, email } = body

		if (typeof name !== 'string') {
			return NextResponse.json(
				{ error: 'Please enter your name.' },
				{ status: 400 },
			)
		}

		const cleanName = name.trim()

		if (!cleanName) {
			return NextResponse.json(
				{ error: 'Please enter your name.' },
				{ status: 400 },
			)
		}

		if (cleanName.length > 100) {
			return NextResponse.json(
				{ error: 'Your name must be 100 characters or fewer.' },
				{ status: 400 },
			)
		}

		if (phone !== undefined && phone !== null && typeof phone !== 'string') {
			return NextResponse.json(
				{ error: 'Please enter a valid phone number.' },
				{ status: 400 },
			)
		}

		const cleanPhone =
			typeof phone === 'string' ? phone.trim() : ''

		const phoneDigits = cleanPhone.replace(/\D/g, '')
		const phoneRequired = existing.role.name === 'LANDLORD'
		const phoneGiven = phoneDigits.length > 0
		const phoneValid =
			phoneDigits.length >= 7 && phoneDigits.length <= 15

		if ((phoneRequired || phoneGiven) && !phoneValid) {
			return NextResponse.json(
				{ error: 'Please enter a valid phone number.' },
				{ status: 400 },
			)
		}

		const user = await prisma.user.update({
			where: { id: payload.userId },
			data: {
				name: cleanName,
				phone: cleanPhone || null,
				email: typeof email === 'string' ? email.trim() : undefined,
			},
			select: profileSelect,
		})

		return NextResponse.json({ user: toProfile(user) })
	} catch (error) {
		console.error('Update profile error:', error)

		return NextResponse.json(
			{ error: 'Something went wrong. Please try again.' },
			{ status: 500 },
		)
	}
}