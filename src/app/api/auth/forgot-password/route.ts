import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'
import { createResetToken } from '@/lib/passwordReset'

// Same answer whether or not the email exists, so nobody can use this
// form to find out who has an account.
const GENERIC_MESSAGE =
	'If an account exists for that email, we’ve sent a link to reset your password.'

function escapeHtml(value: string) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}

async function sendResetEmail(to: string, name: string, link: string) {
	const host = process.env.SMTP_HOST
	const user = process.env.SMTP_USER
	const pass = process.env.SMTP_PASS

	// Development shortcut: no email server set up, so print the link instead.
	if (!host || !user || !pass) {
		if (process.env.NODE_ENV !== 'production') {
			console.log(`\n[dev] Password reset link for ${to}:\n${link}\n`)
			return
		}

		throw new Error('SMTP is not configured.')
	}

	const port = Number(process.env.SMTP_PORT ?? 587)

	const transporter = nodemailer.createTransport({
		host,
		port,
		secure: port === 465,
		auth: { user, pass },
	})

	await transporter.sendMail({
		from: process.env.EMAIL_FROM ?? `StayMatch <${user}>`,
		to,
		subject: 'Reset your StayMatch password',
		text: `Hi ${name},\n\nWe received a request to reset your StayMatch password. Open this link to choose a new one (it expires in 1 hour):\n\n${link}\n\nIf you didn't ask for this, you can ignore this email and your password will stay the same.`,
		html: `
			<p>Hi ${escapeHtml(name)},</p>
			<p>We received a request to reset your StayMatch password. Click the button below to choose a new one. The link expires in 1 hour.</p>
			<p><a href="${link}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#ffffff;border-radius:10px;text-decoration:none;font-weight:bold;">Reset password</a></p>
			<p>Or paste this link into your browser:<br>${escapeHtml(link)}</p>
			<p>If you didn't ask for this, you can ignore this email and your password will stay the same.</p>
		`,
	})
}

export async function POST(request: NextRequest) {
	try {
		const { email } = await request.json()

		if (typeof email !== 'string' || !email.trim()) {
			return NextResponse.json(
				{ error: 'Please enter your email address.' },
				{ status: 400 },
			)
		}

		const user = await prisma.user.findFirst({
			where: { email: { equals: email.trim(), mode: 'insensitive' } },
		})

		if (user) {
			try {
				const token = createResetToken({
					id: user.id,
					passwordHash: user.passwordHash,
				})

				const baseUrl = process.env.APP_URL || request.nextUrl.origin
				const link = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`

				await sendResetEmail(user.email, user.name, link)
			} catch (sendError) {
				// Log it, but still show the generic message to the visitor
				console.error('Could not send password reset email:', sendError)
			}
		}

		return NextResponse.json({ message: GENERIC_MESSAGE })
	} catch (error) {
		console.error('Forgot password error:', error)

		return NextResponse.json(
			{ error: 'Something went wrong. Please try again.' },
			{ status: 500 },
		)
	}
}