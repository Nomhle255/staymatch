import webpush from 'web-push'

let configured = false

function configureWebPush() {
	if (configured) return true

	const subject = process.env.WEB_PUSH_SUBJECT
	const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
	const privateKey = process.env.VAPID_PRIVATE_KEY

	if (!subject || !publicKey || !privateKey) {
		return false
	}

	webpush.setVapidDetails(subject, publicKey, privateKey)
	configured = true
	return true
}

export type PushSubscriptionPayload = {
	endpoint: string
	keys: {
		p256dh: string
		auth: string
	}
}

export async function sendBrowserPush(
	subscription: PushSubscriptionPayload,
	payload: { title: string; message: string; accommodationId: string },
) {
	if (!configureWebPush()) {
		console.error(
			'Browser push is disabled: WEB_PUSH_SUBJECT, NEXT_PUBLIC_VAPID_PUBLIC_KEY, and VAPID_PRIVATE_KEY are required.',
		)
		return { sent: false, reason: 'missing-vapid-config' as const }
	}

	try {
		const delivery = webpush.sendNotification(
			subscription,
			JSON.stringify({
				title: payload.title,
				body: payload.message,
				accommodationId: payload.accommodationId,
			}),
		)

		await Promise.race([
			delivery,
			new Promise<never>((_, reject) =>
				setTimeout(() => reject(new Error('Push provider request timed out.')), 8000),
			),
		])

		return { sent: true as const }
	} catch (error) {
		const statusCode = (error as { statusCode?: number }).statusCode
		const message = error instanceof Error ? error.message : String(error)
		const code = (error as { code?: string }).code
		console.error('Browser push delivery failed:', {
			statusCode,
			code,
			message,
			endpoint: subscription.endpoint,
		})
		return { sent: false, statusCode, message, code }
	}
}