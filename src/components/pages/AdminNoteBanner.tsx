type AdminNoteBannerProps = {
	status: string
	adminNote?: string | null
	adminNoteAt?: string | null
}

function formatDate(value: string) {
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return ''
	return date.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	})
}

// Shows the admin's comment to the landlord. Saving the listing from the
// edit page clears it and puts the listing back online.
export default function AdminNoteBanner({
	status,
	adminNote,
	adminNoteAt,
}: AdminNoteBannerProps) {
	if (!adminNote) return null

	return (
		<div
			role="alert"
			className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm"
		>
			<p className="font-bold text-amber-800">
				Changes requested by the admin
				{adminNoteAt ? ` · ${formatDate(adminNoteAt)}` : ''}
			</p>

			<p className="mt-1 whitespace-pre-wrap text-amber-900">{adminNote}</p>

			{status === 'INACTIVE' && (
				<p className="mt-2 text-xs text-amber-700">
					Your listing is hidden from students. Edit it and save your
					changes to put it back online.
				</p>
			)}
		</div>
	)
}