import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs' // use 'bcrypt' instead if that's what your register route imports
import { prisma } from '@/lib/prisma'
import { isResetTokenValid, readResetToken } from '@/lib/passwordReset'

const INVALID_LINK_ERROR =
	'This reset link is invalid or has expired. Please request a new one.'

const MIN_PASSWORD_LENGTH = 8

export async function POST(request: NextRequest) {
	try {
		const { token, password } = await request.json()

		if (typeof token !== 'string' || !token) {
			return NextResponse.json({ error: INVALID_LINK_ERROR }, { status: 400 })
		}

		if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
			return NextResponse.json(
				{
					error: `Your password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
				},
				{ status: 400 },
			)
		}

		// 1. Who does the token claim to be for, and has it expired?
		const claim = readResetToken(token)

		if (!claim || claim.exp < Date.now()) {
			return NextResponse.json({ error: INVALID_LINK_ERROR }, { status: 400 })
		}

		const user = await prisma.user.findUnique({ where: { id: claim.uid } })

		// 2. Is the signature genuine for this user's CURRENT password?
		//    (Fails automatically once the password has been changed, so each link works once.)
		if (!user || !isResetTokenValid(token, user)) {
			return NextResponse.json({ error: INVALID_LINK_ERROR }, { status: 400 })
		}

		// 3. Save the new password
		const passwordHash = await bcrypt.hash(password, 10)

		await prisma.user.update({
			where: { id: user.id },
			data: { passwordHash },
		})

		return NextResponse.json({ message: 'Your password has been updated.' })
	} catch (error) {
		console.error('Reset password error:', error)

		return NextResponse.json(
			{ error: 'Something went wrong. Please try again.' },
			{ status: 500 },
		)
	}
}