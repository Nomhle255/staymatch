import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { email, password } = body

		if (!email || !password) {
			return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
		}

		const user = await prisma.user.findUnique({ where: { email } })
		if (!user) {
			return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
		}

		const isValid = await verifyPassword(password, user.passwordHash)
		if (!isValid) {
			return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
		}

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
		console.error('Login error:', error)
		return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
	}
}