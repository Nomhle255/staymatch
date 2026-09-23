'use client'

import { useState, type ReactNode, type ComponentType } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

const inputClasses =
	'w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'

type FieldProps = {
	label: string
	children: ReactNode
}

function Field({ label, children }: FieldProps) {
	return (
		<label className="grid gap-2">
			<span className="text-sm font-bold text-slate-900">{label}</span>
			{children}
		</label>
	)
}

type InputShellProps = {
	icon: ComponentType<{ className?: string }>
	children: ReactNode
}

function InputShell({ icon: Icon, children }: InputShellProps) {
	return (
		<div className="relative">
			<Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
			{children}
		</div>
	)
}

function LoginPage() {
	const router = useRouter()
	const [showPassword, setShowPassword] = useState(false)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [successMessage, setSuccessMessage] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()
		setError('')
		setIsSubmitting(true)

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			})

			const data = await response.json()

			if (!response.ok) {
				setError(data.error ?? 'Something went wrong.')
				setIsSubmitting(false)
				return
			}

			setSuccessMessage('Logged in successfully! Redirecting...')

			const role = data.user?.role

			setTimeout(() => {
				if (role === 'ADMINISTRATOR') {
					router.push('/admin')
				} else if (role === 'LANDLORD') {
					router.push('/landlord/dashboard')
				} else if (role === 'STUDENT') {
					router.push('/student/dashboard')
				} else {
					router.push('/')
				}
			}, 1200)
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
						<p className="text-xs font-medium text-slate-500">Student Accommodation Made Easy</p>
					</div>
				</div>
			</div>

			<div className="mx-auto mt-8 max-w-md rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-[0_30px_70px_rgba(30,41,59,0.1)] sm:p-10">
				<div className="text-center">
					<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">
						Welcome Back
					</h1>
					<p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500 sm:text-base">
						Log in to continue your search or manage your listings.
					</p>
				</div>

				<form className="mt-8 space-y-5" onSubmit={handleSubmit}>
					{successMessage && (
						<div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">{successMessage}</div>
					)}
					{error && (
						<div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">{error}</div>
					)}

					<Field label="Email Address">
						<InputShell icon={Mail}>
							<input
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								placeholder="Enter your email address"
								required
								className={inputClasses}
							/>
						</InputShell>
					</Field>

					<Field label="Password">
						<div className="relative">
							<Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
							<input
								type={showPassword ? 'text' : 'password'}
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								placeholder="Enter your password"
								required
								className={`${inputClasses} pr-11`}
							/>
							<button
								type="button"
								onClick={() => setShowPassword((show) => !show)}
								className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
								aria-label={showPassword ? 'Hide password' : 'Show password'}
							>
								{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</button>
						</div>
					</Field>

					<div className="flex items-center justify-between text-sm">
						<a href="#" className="font-semibold text-blue-600 hover:text-blue-700">
							Forgot password?
						</a>
						<p className="text-center text-sm text-slate-500">
						Don't have an account?{' '}
						<Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
							Sign up
						</Link>
					</p>
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-60"
					>
						{isSubmitting ? 'Signing in...' : 'Sign In'}
						{!isSubmitting && <ArrowRight className="h-4 w-4" />}
					</button>

					<div className="flex items-center gap-4 text-xs font-medium text-slate-400">
						<span className="h-px flex-1 bg-slate-200" />
						or
						<span className="h-px flex-1 bg-slate-200" />
					</div>

					<button
						type="button"
						className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
					>
						<svg className="h-4 w-4" viewBox="0 0 24 24">
							<path
								fill="#4285F4"
								d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.63h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.87c2.27-2.09 3.58-5.17 3.58-8.8z"
							/>
							<path
								fill="#34A853"
								d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1C3.24 21.3 7.28 24 12 24z"
							/>
							<path
								fill="#FBBC05"
								d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29v-3.1H1.27A11.94 11.94 0 000 12c0 1.94.46 3.77 1.27 5.39l4-3.1z"
							/>
							<path
								fill="#EA4335"
								d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.28 0 3.24 2.7 1.27 6.61l4 3.1C6.22 6.86 8.87 4.75 12 4.75z"
							/>
						</svg>
						Sign in with Google
					</button>
				</form>
			</div>
		</main>
	)
}

export default LoginPage