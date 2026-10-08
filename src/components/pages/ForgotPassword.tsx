'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowRight, ArrowLeft, MailCheck } from 'lucide-react'

const inputClasses =
	'w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'

function ForgotPassword() {
	const [email, setEmail] = useState('')
	const [error, setError] = useState('')
	const [sentMessage, setSentMessage] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()
		setError('')
		setIsSubmitting(true)

		try {
			const response = await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			})

			const data = await response.json().catch(() => null)

			if (!response.ok || !data) {
				setError(data?.error ?? 'Something went wrong.')
				setIsSubmitting(false)
				return
			}

			setSentMessage(data.message)
			setIsSubmitting(false)
		} catch {
			setError('Could not reach the server. Please try again.')
			setIsSubmitting(false)
		}
	}

	return (
		<main className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white px-4 py-6 sm:px-6 lg:px-10">
			<div className="mx-auto flex max-w-6xl items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/25">
						⌂
					</div>
					<div>
						<p className="text-xl font-black tracking-[-0.03em] text-slate-950">
							Stay<span className="text-blue-600">Match</span>
						</p>
						<p className="text-xs font-medium text-slate-500">
							Student Accommodation Made Easy
						</p>
					</div>
				</div>
			</div>

			<div className="mx-auto mt-8 max-w-md rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-[0_30px_70px_rgba(30,41,59,0.1)] sm:p-10">
				{sentMessage ? (
					<div className="text-center">
						<div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
							<MailCheck className="h-7 w-7" />
						</div>

						<h1 className="mt-5 text-3xl font-black tracking-[-0.05em] text-slate-950">
							Check your email
						</h1>

						<p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">
							{sentMessage} The link expires in 1 hour.
						</p>

						<Link
							href="/login"
							className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
						>
							<ArrowLeft className="h-4 w-4" />
							Back to sign in
						</Link>
					</div>
				) : (
					<>
						<div className="text-center">
							<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">
								Forgot Password?
							</h1>
							<p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500 sm:text-base">
								Enter your email and we&apos;ll send you a link to
								choose a new password.
							</p>
						</div>

						<form className="mt-8 space-y-5" onSubmit={handleSubmit}>
							{error && (
								<div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
									{error}
								</div>
							)}

							<label className="grid gap-2">
								<span className="text-sm font-bold text-slate-900">
									Email Address
								</span>

								<div className="relative">
									<Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

									<input
										type="email"
										value={email}
										onChange={(event) => setEmail(event.target.value)}
										placeholder="Enter your email address"
										required
										className={inputClasses}
									/>
								</div>
							</label>

							<button
								type="submit"
								disabled={isSubmitting}
								className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-60"
							>
								{isSubmitting ? 'Sending...' : 'Send reset link'}
								{!isSubmitting && <ArrowRight className="h-4 w-4" />}
							</button>

							<Link
								href="/login"
								className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
							>
								<ArrowLeft className="h-4 w-4" />
								Back to sign in
							</Link>
						</form>
					</>
				)}
			</div>
		</main>
	)
}

export default ForgotPassword