self.addEventListener('push', (event) => {
	const data = event.data?.json() ?? {}

	event.waitUntil(
		self.registration.showNotification(data.title || 'StayMatch update', {
			body: data.body || 'You have a new accommodation update.',
			icon: '/favicon.svg',
			badge: '/favicon.svg',
			data: {
				accommodationId: data.accommodationId,
			},
		}),
	)
})

self.addEventListener('notificationclick', (event) => {
	event.notification.close()

	const accommodationId = event.notification.data?.accommodationId
	const target = accommodationId
		? `/students/accommodationdetails?id=${encodeURIComponent(accommodationId)}`
		: '/student-dashboard'

	event.waitUntil(
		clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
			const existingClient = windowClients.find((client) => 'focus' in client)

			if (existingClient) {
				existingClient.navigate(target)
				return existingClient.focus()
			}

			return clients.openWindow(target)
		}),
	)
})
