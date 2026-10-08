import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const googleClient = new OAuth2Client(googleClientId)

// Administrators can never be created through self-service sign-up.
const SELF_SERVICE_ROLES = ['STUDENT', 'LANDLORD'] as const
type SelfServiceRole = (typeof SELF_SERVICE_ROLES)[number]

function isSelfServiceRole(value: unknown): value is SelfServiceRole {
	return (
		typeof value === 'string' &&
		(SELF_SERVICE_ROLES as readonly string[]).includes(value)
	)
}

export async function POST(request: NextRequest) {
	try {
		if (!googleClientId) {
			console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set.')

			return NextResponse.json(
				{ error: 'Google sign-in is not configured.' },
				{ status: 500 },
			)
		}

		const { accessToken, role, phone } = await request.json()

		if (typeof accessToken !== 'string' || !accessToken) {
			return NextResponse.json(
				{ error: 'Missing Google access token.' },
				{ status: 400 },
			)
		}

		// 1. Verify the token with Google. Never trust an email sent by the client.
		let email = ''
		let name = ''

		try {
			const info = await googleClient.getTokenInfo(accessToken)

			// The token must have been issued to THIS app
			if (info.aud !== googleClientId) {
				throw new Error('Token was not issued for this app.')
			}

			if (!info.email || String(info.email_verified) !== 'true') {
				return NextResponse.json(
					{ error: 'Your Google email address is not verified.' },
					{ status: 401 },
				)
			}

			email = info.email.toLowerCase()

			const profileResponse = await fetch(
				'https://www.googleapis.com/oauth2/v3/userinfo',
				{ headers: { Authorization: `Bearer ${accessToken}` } },
			)

			if (profileResponse.ok) {
				const profile = await profileResponse.json()
				name = typeof profile.name === 'string' ? profile.name : ''
			}
		} catch (verifyError) {
			console.error('Google token verification failed:', verifyError)

			return NextResponse.json(
				{ error: 'Google sign-in could not be verified. Please try again.' },
				{ status: 401 },
			)
		}

		// 2. Find an existing account with this email.
		let user = await prisma.user.findFirst({
			where: { email: { equals: email, mode: 'insensitive' } },
		})

		// 3. New user: ask the client which role they want before creating anything.
		if (!user) {
			if (!isSelfServiceRole(role)) {
				return NextResponse.json({
					needsRole: true,
					name,
					email,
				})
			}

			const cleanPhone = typeof phone === 'string' ? phone.trim() : ''
			const phoneDigits = cleanPhone.replace(/\D/g, '')

			// Students contact landlords over WhatsApp, so landlords need a number.
			// Students may leave it empty, but if they enter one it must be valid.
			const phoneRequired = role === 'LANDLORD'
			const phoneGiven = phoneDigits.length > 0
			const phoneValid = phoneDigits.length >= 7 && phoneDigits.length <= 15

			if ((phoneRequired || phoneGiven) && !phoneValid) {
				return NextResponse.json(
					{ error: 'Please enter a valid phone number.' },
					{ status: 400 },
				)
			}

			user = await prisma.user.create({
				data: {
					name: name || email.split('@')[0],
					email,
					phone: cleanPhone || null,
					role,
					// Google accounts have no password. This is not a valid hash,
					// so password login can never succeed for this account.
					passwordHash: `google-oauth:${randomBytes(32).toString('hex')}`,
				},
			})
		}

		// 4. Issue the same session cookie the password login uses.
		// NOTE: keep this identical to /api/auth/login/route.ts
		const token = signToken({ userId: user.id, role: user.role })

		const response = NextResponse.json({
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		})

		response.cookies.set('staymatch_token', token, {
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			path: '/',
			maxAge: 60 * 60 * 24 * 7,
		})

		return response
	} catch (error) {
		console.error('Google sign-in error:', error)

		return NextResponse.json(
			{ error: 'Something went wrong. Please try again.' },
			{ status: 500 },
		)
	}
}