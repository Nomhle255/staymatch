import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken } from '@/lib/auth'

const ROLE_MAP = {
	student: 'STUDENT',
	landlord: 'LANDLORD',
	administrator: 'ADMINISTRATOR',
} as const

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { name, email, phone, password, role } = body

		if (!name || !email || !password || !role) {
			return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
		}

		const mappedRole = ROLE_MAP[role as keyof typeof ROLE_MAP]
		if (!mappedRole) {
			return NextResponse.json({ error: 'Invalid role.' }, { status: 400 })
		}

		const existingUser = await prisma.user.findUnique({ where: { email } })
		if (existingUser) {
			return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
		}

		const passwordHash = await hashPassword(password)

		const user = await prisma.user.create({
			data: {
				name,
				email,
				phone,
				role: mappedRole,
				passwordHash,
			},
		})

		const token = signToken({ userId: user.id, role: user.role })

		const response = NextResponse.json({
			user: { id: user.id, name: user.name, email: user.email, role: user.role },
		})

		response.cookies.set('staymatch_token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7,
		})

		return response
	} catch (error) {
		console.error('Registration error:', error)
		return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
	}
}