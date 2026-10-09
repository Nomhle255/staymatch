'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'

const inputClasses =
	'w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'

const MIN_PASSWORD_LENGTH = 8

function ResetPassword() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const token = searchParams.get('token')

	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)

	const [error, setError] = useState('')
	const [successMessage, setSuccessMessage] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()
		setError('')

		if (password.length < MIN_PASSWORD_LENGTH) {
			setError(`Your password must be at least ${MIN_PASSWORD_LENGTH} characters long.`)
			return
		}

		if (password !== confirmPassword) {
			setError('Passwords do not match.')
			return
		}

		setIsSubmitting(true)

		try {
			const response = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token, password }),
			})

			const data = await response.json().catch(() => null)

			if (!response.ok || !data) {
				setError(data?.error ?? 'Something went wrong.')
				setIsSubmitting(false)
				return
			}

			setSuccessMessage('Password updated! Redirecting to login...')

			setTimeout(() => {
				router.push('/login')
			}, 1500)
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
				{!token ? (
					<div className="text-center">
						<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950">
							Link not valid
						</h1>

						<p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">
							This password reset link is missing or incomplete.
							Please request a new one.
						</p>

						<Link
							href="/forgot-password"
							className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700"
						>
							Request a new link
							<ArrowRight className="h-4 w-4" />
						</Link>
					</div>
				) : (
					<>
						<div className="text-center">
							<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">
								Create New Password
							</h1>
							<p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500 sm:text-base">
								Choose a new password for your StayMatch account.
							</p>
						</div>

						<form className="mt-8 space-y-5" onSubmit={handleSubmit}>
							{successMessage && (
								<div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">
									{successMessage}
								</div>
							)}

							{error && (
								<div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
									{error}{' '}
									{error.includes('invalid or has expired') && (
										<Link
											href="/forgot-password"
											className="font-bold underline"
										>
											Request a new link
										</Link>
									)}
								</div>
							)}

							<label className="grid gap-2">
								<span className="text-sm font-bold text-slate-900">
									New Password
								</span>

								<div className="relative">
									<Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

									<input
										type={showPassword ? 'text' : 'password'}
										value={password}
										onChange={(event) => setPassword(event.target.value)}
										placeholder="At least 8 characters"
										required
										minLength={MIN_PASSWORD_LENGTH}
										className={inputClasses}
									/>

									<button
										type="button"
										onClick={() => setShowPassword((show) => !show)}
										className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
										aria-label={showPassword ? 'Hide password' : 'Show password'}
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
							</label>

							<label className="grid gap-2">
								<span className="text-sm font-bold text-slate-900">
									Confirm New Password
								</span>

								<div className="relative">
									<Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

									<input
										type={showConfirm ? 'text' : 'password'}
										value={confirmPassword}
										onChange={(event) => setConfirmPassword(event.target.value)}
										placeholder="Confirm your new password"
										required
										className={inputClasses}
									/>

									<button
										type="button"
										onClick={() => setShowConfirm((show) => !show)}
										className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
										aria-label={showConfirm ? 'Hide password' : 'Show password'}
									>
										{showConfirm ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
							</label>

							<button
								type="submit"
								disabled={isSubmitting || Boolean(successMessage)}
								className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-60"
							>
								{isSubmitting ? 'Updating...' : 'Update password'}
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

// useSearchParams() requires a Suspense boundary or `next build` fails.
export default function ResetPasswordPage() {
	return (
		<Suspense fallback={null}>
			<ResetPassword />
		</Suspense>
	)
}