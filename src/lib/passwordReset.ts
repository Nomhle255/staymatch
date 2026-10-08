import { createHmac, timingSafeEqual } from 'crypto'

/*
 * Stateless password-reset tokens (no database table needed).
 *
 * A token looks like  <payload>.<signature>
 *  - payload   = base64url({ uid, exp })
 *  - signature = HMAC-SHA256 over the payload, keyed with
 *                PASSWORD_RESET_SECRET + the user's CURRENT passwordHash
 *
 * Because the user's current passwordHash is part of the key, the token
 * stops working the moment the password changes. That makes every link
 * single-use without storing anything.
 */

const TOKEN_LIFETIME_MS = 60 * 60 * 1000 // 1 hour

function getSecret() {
	const secret = process.env.PASSWORD_RESET_SECRET

	if (!secret) {
		throw new Error('PASSWORD_RESET_SECRET is not set.')
	}

	return secret
}

function sign(payload: string, passwordHash: string) {
	return createHmac('sha256', `${getSecret()}:${passwordHash}`)
		.update(payload)
		.digest('base64url')
}

export function createResetToken(user: { id: string; passwordHash: string }) {
	const payload = Buffer.from(
		JSON.stringify({ uid: user.id, exp: Date.now() + TOKEN_LIFETIME_MS }),
	).toString('base64url')

	return `${payload}.${sign(payload, user.passwordHash)}`
}

// Reads the token WITHOUT trusting it, only to find out which user it claims to be for.
export function readResetToken(
	token: string,
): { uid: string; exp: number } | null {
	const parts = token.split('.')

	if (parts.length !== 2 || !parts[0]) return null

	try {
		const data = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'))

		if (typeof data.uid !== 'string' || typeof data.exp !== 'number') {
			return null
		}

		return { uid: data.uid, exp: data.exp }
	} catch {
		return null
	}
}

// Checks the signature against the user's current passwordHash.
export function isResetTokenValid(
	token: string,
	user: { passwordHash: string },
) {
	const parts = token.split('.')

	if (parts.length !== 2) return false

	const [payload, signature] = parts

	const expected = Buffer.from(sign(payload, user.passwordHash))
	const received = Buffer.from(signature)

	return (
		expected.length === received.length &&
		timingSafeEqual(expected, received)
	)
}