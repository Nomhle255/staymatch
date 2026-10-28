import { Suspense } from 'react'
import ResetPassword from '@/components/pages/ResetPassword'

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading...</p>}>
			<ResetPassword />
		</Suspense>
	)
}