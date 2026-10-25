'use client'

import {
	useCallback,
	useEffect,
	useState,
	type ReactNode,
	type ComponentType,
} from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
	Mail,
	Lock,
	Eye,
	EyeOff,
	ArrowRight,
	Phone,
} from 'lucide-react'
import { useGoogleAuth } from '@/hooks/useGoogleAuth'

const inputClasses =
	'w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'

// A role returned by /api/roles.
type RoleOption = {
	name: string
	label: string
}

type FieldProps = {
	label: string
	children: ReactNode
}

function Field({ label, children }: FieldProps) {
	return (
		<label className="grid gap-2">
			<span className="text-sm font-bold text-slate-900">
				{label}
			</span>
			{children}
		</label>
	)
}

type InputShellProps = {
	icon: ComponentType<{ className?: string }>
	children: ReactNode
}

function InputShell({
	icon: Icon,
	children,
}: InputShellProps) {
	return (
		<div className="relative">
			<Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
			{children}
		</div>
	)
}

function LoginPage() {
	const router = useRouter()

	const [showPassword, setShowPassword] =
		useState(false)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [successMessage, setSuccessMessage] =
		useState('')
	const [isSubmitting, setIsSubmitting] =
		useState(false)

	const [pendingToken, setPendingToken] =
		useState<string | null>(null)

	// Roles a new Google user can choose from, loaded from the database.
	const [roles, setRoles] = useState<RoleOption[]>([])
	const [rolesLoading, setRolesLoading] = useState(false)
	const [selectedRole, setSelectedRole] = useState('')

	const [phone, setPhone] = useState('')

	// Load the roles only when the role picker is needed.
	useEffect(() => {
		if (!pendingToken || roles.length > 0) return

		let cancelled = false

		async function loadRoles() {
			setRolesLoading(true)

			try {
				const response = await fetch('/api/roles')
				const data = await response.json()

				if (!response.ok) throw new Error(data?.error)

				if (!cancelled) {
					const loaded: RoleOption[] = data.roles
					setRoles(loaded)

					// Default to STUDENT if available, otherwise the first role.
					setSelectedRole(
						(current) =>
							current ||
							loaded.find((r) => r.name === 'STUDENT')?.name ||
							loaded[0]?.name ||
							'',
					)
				}
			} catch (err) {
				console.error('Failed to load roles:', err)
				if (!cancelled) {
					setError('We couldn’t load the account types. Please try again.')
				}
			} finally {
				if (!cancelled) setRolesLoading(false)
			}
		}

		loadRoles()

		return () => {
			cancelled = true
		}
	}, [pendingToken, roles.length])

	const redirectByRole = useCallback(
		(role: string | undefined) => {
			setSuccessMessage(
				'Logged in successfully! Redirecting...',
			)

			setTimeout(() => {
				if (role === 'ADMINISTRATOR') {
					router.push('/admin')
				} else if (role === 'LANDLORD') {
					router.push('/landlord/dashboard')
				} else if (role === 'STUDENT') {
					router.push('/students/dashboard')
				} else {
					router.push('/')
				}
			}, 1200)
		},
		[router],
	)

	const submitGoogle = useCallback(
		async (
			accessToken: string,
			extra?: {
				role: string
				phone: string
			},
		) => {
			setError('')
			setIsSubmitting(true)

			try {
				const response = await fetch(
					'/api/auth/google',
					{
						method: 'POST',
						headers: {
							'Content-Type':
								'application/json',
						},
						body: JSON.stringify({
							accessToken,
							...extra,
						}),
					},
				)

				const data =
					await response.json().catch(
						() => null,
					)

				if (!response.ok || !data) {
					if (response.status === 401) {
						setError('We couldn’t verify your Google sign-in. Please try again.')
						setPendingToken(null)
					} else if (response.status === 429) {
						setError('Too many attempts. Please wait a moment and try again.')
					} else if (response.status >= 500) {
						setError('Sign-in is temporarily unavailable. Please try again later.')
					} else {
						setError('We couldn’t complete your sign-in. Please try again.')
					}

					console.error('Google login request failed:', {
						status: response.status,
						errorCode: data?.code,
					})
					return
				}

				if (data.needsRole) {
					setPendingToken(accessToken)
					setIsSubmitting(false)
					return
				}

				setPendingToken(null)
				redirectByRole(data.user?.role)
			} catch (error) {
				console.error('Unexpected Google login error:', error)
				setError(
					'We couldn’t sign you in right now. Please check your connection and try again.',
				)
			} finally {
				setIsSubmitting(false)
			}
		},
		[redirectByRole],
	)

	const { requestAccessToken } = useGoogleAuth({
		onSuccess: submitGoogle,
		onError: (message) => {
			// Keep technical authentication errors out of the user interface.
			console.error('Google authentication failed:', message)
			setError('We couldn’t sign you in with Google. Please try again.')
			setIsSubmitting(false)
		},
	})

	const handleGoogleClick = () => {
		setError('')
		setSuccessMessage('')
		setIsSubmitting(true)
		requestAccessToken()
	}

	const handleRoleSubmit = async (
		event: React.FormEvent,
	) => {
		event.preventDefault()

		if (!pendingToken) return

		if (!selectedRole) {
			setError('Please choose how you will use StayMatch.')
			return
		}

		if (
			selectedRole === 'LANDLORD' &&
			!phone.trim()
		) {
			setError(
				'Please enter your phone number.',
			)
			return
		}

		await submitGoogle(pendingToken, {
			role: selectedRole,
			phone: phone.trim(),
		})
	}

	const handleSubmit = async (
		event: React.FormEvent,
	) => {
		event.preventDefault()
		setError('')
		setSuccessMessage('')
		setIsSubmitting(true)

		try {
			const response = await fetch(
				'/api/auth/login',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ email, password }),
				},
			)

			// Some server/proxy errors return HTML or an empty body instead of JSON.
			const data = await response.json().catch(() => null)

			if (!response.ok) {
				if (response.status === 401) {
					setError('The email or password you entered is incorrect.')
				} else if (response.status === 403) {
					setError('You cannot sign in at this time. Please contact support if the problem continues.')
				} else if (response.status === 429) {
					setError('Too many sign-in attempts. Please wait a moment and try again.')
				} else if (response.status >= 500) {
					setError('We’re having trouble signing you in. Please try again later.')
				} else {
					setError('We couldn’t sign you in. Please check your details and try again.')
				}

				console.error('Login request failed:', {
					status: response.status,
					errorCode: data?.code,
				})
				return
			}

			if (!data?.user?.role) {
				console.error('Login returned an unexpected response.')
				setError('We couldn’t complete your sign-in. Please try again.')
				return
			}

			setSuccessMessage('Sign-in successful! Redirecting...')

			const role = data.user.role
			setTimeout(() => {
				if (role === 'ADMINISTRATOR') {
					router.push('/admin')
				} else if (role === 'LANDLORD') {
					router.push('/landlord/dashboard')
				} else if (role === 'STUDENT') {
					router.push('/students/dashboard')
				} else {
					router.push('/')
				}
			}, 1200)
		} catch (error) {
			console.error('Unexpected login error:', error)
			setError(
				'We couldn’t sign you in right now. Please check your connection and try again.',
			)
		} finally {
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
							Stay
							<span className="text-blue-600">
								Match
							</span>
						</p>

						<p className="text-xs font-medium text-slate-500">
							Student Accommodation Made Easy
						</p>
					</div>
				</div>
			</div>

			<div className="mx-auto mt-8 max-w-md rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-[0_30px_70px_rgba(30,41,59,0.1)] sm:p-10">
				<div className="text-center">
					<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">
						Welcome 
					</h1>

					<p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500 sm:text-base">
						Log in to continue your search or manage your listings.
					</p>
				</div>

				{pendingToken ? (
					<form
						className="mt-8 space-y-5"
						onSubmit={handleRoleSubmit}
					>
						{successMessage && (
							<div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">
								{successMessage}
							</div>
						)}

						{error && (
							<div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
								{error}
							</div>
						)}

						<p className="text-center text-sm font-semibold text-slate-700">
							How will you use StayMatch?
						</p>

						{rolesLoading ? (
							<p className="text-center text-sm text-slate-400">
								Loading...
							</p>
						) : (
							<div className="grid gap-3 sm:grid-cols-2">
								{roles.map((option) => (
									<button
										key={option.name}
										type="button"
										onClick={() =>
											setSelectedRole(
												option.name,
											)
										}
										aria-pressed={
											selectedRole ===
											option.name
										}
										className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
											selectedRole ===
											option.name
												? 'border-blue-400 bg-blue-50 text-blue-700'
												: 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
										}`}
									>
										{option.label}
									</button>
								))}
							</div>
						)}

						<Field label="Phone number">
							<InputShell icon={Phone}>
								<input
									type="tel"
									value={phone}
									onChange={(event) =>
										setPhone(
											event.target.value,
										)
									}
									placeholder="Enter your phone number"
									required={
										selectedRole ===
										'LANDLORD'
									}
									className={inputClasses}
								/>
							</InputShell>
						</Field>

						<button
							type="submit"
							disabled={
								isSubmitting ||
								rolesLoading ||
								!selectedRole
							}
							className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-60"
						>
							{isSubmitting
								? 'Creating account...'
								: 'Create account'}

							{!isSubmitting && (
								<ArrowRight className="h-4 w-4" />
							)}
						</button>

						<button
							type="button"
							onClick={() => {
								setPendingToken(null)
								setPhone('')
								setError('')
							}}
							disabled={isSubmitting}
							className="w-full text-center text-sm font-semibold text-slate-500 transition hover:text-slate-700"
						>
							Back to sign in
						</button>
					</form>
				) : (
					<form
						className="mt-8 space-y-5"
						onSubmit={handleSubmit}
					>
						{successMessage && (
							<div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">
								{successMessage}
							</div>
						)}

						{error && (
							<div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
								{error}
							</div>
						)}

						<Field label="Email Address">
							<InputShell icon={Mail}>
								<input
									type="email"
									value={email}
									onChange={(event) =>
										setEmail(
											event.target.value,
										)
									}
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
									type={
										showPassword
											? 'text'
											: 'password'
									}
									value={password}
									onChange={(event) =>
										setPassword(
											event.target.value,
										)
									}
									placeholder="Enter your password"
									required
									className={`${inputClasses} pr-11`}
								/>

								<button
									type="button"
									onClick={() =>
										setShowPassword(
											(show) =>
												!show,
										)
									}
									className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
									aria-label={
										showPassword
											? 'Hide password'
											: 'Show password'
									}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</Field>

						<div className="flex items-center justify-between text-sm">
							<Link href="/forgot-password" className="font-semibold text-blue-600 hover:text-blue-700">
								Forgot password?
							</Link>
						</div>

						<button
							type="submit"
							disabled={isSubmitting}
							className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-60"
						>
							{isSubmitting
								? 'Signing in...'
								: 'Sign In'}

							{!isSubmitting && (
								<ArrowRight className="h-4 w-4" />
							)}
						</button>

						<div className="flex items-center gap-4 text-xs font-medium text-slate-400">
							<span className="h-px flex-1 bg-slate-200" />
							or
							<span className="h-px flex-1 bg-slate-200" />
						</div>

						<button
							type="button"
							onClick={handleGoogleClick}
							disabled={isSubmitting}
							className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
						>
							<svg
								className="h-4 w-4"
								viewBox="0 0 24 24"
							>
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

						<p className="text-center text-sm text-slate-500">
							Don't have an account?{' '}
							<Link
								href="/register"
								className="font-semibold text-blue-600 hover:text-blue-700"
							>
								Sign up
							</Link>
						</p>
					</form>
				)}
			</div>
		</main>
	)
}

export default LoginPage