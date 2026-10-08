'use client'

import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type ReactNode,
	type ComponentType,
} from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import {
	User,
	Mail,
	Phone,
	Lock,
	Eye,
	EyeOff,
	ChevronDown,
	GraduationCap,
	Home,
	ShieldCheck,
	ArrowRight,
} from 'lucide-react'

declare global {
	interface Window {
		google?: any
	}
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

const roleOptions = [
	{
		value: 'student',
		label: 'Student',
		icon: GraduationCap,
	},
	{
		value: 'landlord',
		label: 'Landlord',
		icon: Home,
	},
	{
		value: 'administrator',
		label: 'Administrator',
		icon: ShieldCheck,
	},
] as const

type Role = (typeof roleOptions)[number]['value']

type FieldProps = {
	label: string
	children: ReactNode
}

function Field({ label, children }: FieldProps) {
	return (
		<label className="grid gap-2">
			<span className="text-sm font-bold text-slate-900">
				{label} <span className="text-blue-600">*</span>
			</span>

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

const inputClasses =
	'w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'

function RegisterUser() {
	const router = useRouter()

	const [roleOpen, setRoleOpen] = useState(false)
	const [role, setRole] = useState<Role | null>(null)

	const [showPassword, setShowPassword] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)

	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [phone, setPhone] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [agreed, setAgreed] = useState(false)

	const [error, setError] = useState('')
	const [successMessage, setSuccessMessage] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Google sign-up
	const googleTokenClientRef = useRef<any>(null)

	// Stores the Google access token while additional
	// registration information is being collected.
	const [pendingGoogleToken, setPendingGoogleToken] =
		useState<string | null>(null)

	const [googleReady, setGoogleReady] = useState(false)

	const selectedRole = roleOptions.find(
		(option) => option.value === role,
	)

	const redirectByRole = useCallback(
		(userRole: string | undefined) => {
			setSuccessMessage(
				'Registered successfully! Redirecting...',
			)

			setTimeout(() => {
				if (userRole === 'ADMINISTRATOR') {
					router.push('/admin')
				} else if (userRole === 'LANDLORD') {
					router.push('/landlord/dashboard')
				} else if (userRole === 'STUDENT') {
					router.push('/students/dashboard')
				} else {
					router.push('/')
				}
			}, 1200)
		},
		[router],
	)

	/**
	 * Send the Google access token to the backend.
	 *
	 * The first request only sends the access token.
	 * If the backend identifies this as a new account,
	 * it returns needsRole=true. We then collect the
	 * user's role and phone number.
	 */
	const submitGoogle = useCallback(
		async (
			accessToken: string,
			additionalData?: {
				role: Role
				phone: string
			},
		) => {
			setError('')
			setIsSubmitting(true)

			try {
				const response = await fetch('/api/auth/google', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						accessToken,
						...(additionalData
							? {
									role: additionalData.role.toUpperCase(),
									phone: additionalData.phone.trim(),
								}
							: {}),
					}),
				})

				const data = await response
					.json()
					.catch(() => null)

				if (!response.ok || !data) {
					setError(
						data?.error ??
							'Google sign-up failed. Please try again.',
					)
					setIsSubmitting(false)
					return
				}

				/*
				 * Google authentication was successful, but
				 * this is a new account and the backend needs
				 * the user's role before creating it.
				 */
				if (data.needsRole) {
					setPendingGoogleToken(accessToken)
					setIsSubmitting(false)
					return
				}

				setPendingGoogleToken(null)
				redirectByRole(data.user?.role)
			} catch (error) {
				console.error(
					'Google registration error:',
					error,
				)

				setError(
					'Could not reach the server. Please try again.',
				)
				setIsSubmitting(false)
			}
		},
		[redirectByRole],
	)

	/**
	 * Initialise Google Identity Services after the
	 * Google script has loaded.
	 */
	useEffect(() => {
		if (
			!googleReady ||
			!GOOGLE_CLIENT_ID ||
			!window.google?.accounts?.oauth2
		) {
			return
		}

		googleTokenClientRef.current =
			window.google.accounts.oauth2.initTokenClient({
				client_id: GOOGLE_CLIENT_ID,
				scope: 'openid email profile',

				callback: (response: {
					access_token?: string
					error?: string
				}) => {
					if (response.access_token) {
						/*
						 * IMPORTANT:
						 * Do not check the role here.
						 *
						 * Google must open and authenticate first.
						 */
						submitGoogle(response.access_token)
					} else if (response.error) {
						setError(
							'Google sign-up was cancelled or failed. Please try again.',
						)
						setIsSubmitting(false)
					}
				},

				error_callback: () => {
					setError(
						'Google sign-up was cancelled or failed. Please try again.',
					)
					setIsSubmitting(false)
				},
			})
	}, [googleReady, submitGoogle])

	/**
	 * Start Google OAuth.
	 *
	 * This intentionally does NOT require the user
	 * to select a role first. Google opens immediately,
	 * just like it does on the Login page.
	 */
	const handleGoogleClick = () => {
		setError('')
		setSuccessMessage('')

		if (!GOOGLE_CLIENT_ID) {
			setError(
				'Google sign-up is not configured yet.',
			)
			return
		}

		if (!googleTokenClientRef.current) {
			setError(
				'Google sign-up is still loading. Please try again in a moment.',
			)
			return
		}

		setIsSubmitting(true)

		// Open Google's account selection/authentication.
		googleTokenClientRef.current.requestAccessToken()
	}

	/**
	 * Complete Google registration after the user has
	 * selected their role and supplied any required data.
	 */
	const handleCompleteGoogleRegistration = async () => {
		setError('')

		if (!pendingGoogleToken) {
			setError(
				'Your Google session has expired. Please try again.',
			)
			return
		}

		if (!role) {
			setError('Please select your role.')
			return
		}

		if (role === 'administrator') {
			setError(
				'Administrator accounts cannot be created with Google.',
			)
			return
		}

		if (role === 'landlord' && !phone.trim()) {
			setError(
				'Please enter your phone number first. Students use it to contact landlords.',
			)
			return
		}

		await submitGoogle(pendingGoogleToken, {
			role,
			phone: phone.trim(),
		})
	}

	const handleSubmit = async (
		event: React.FormEvent,
	) => {
		event.preventDefault()
		setError('')
		setSuccessMessage('')

		if (!role) {
			setError('Please select your role.')
			return
		}

		if (password !== confirmPassword) {
			setError('Passwords do not match.')
			return
		}

		if (!agreed) {
			setError(
				'You must agree to the Terms of Service and Privacy Policy.',
			)
			return
		}

		setIsSubmitting(true)

		try {
			const response = await fetch(
				'/api/auth/register',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						name: name.trim(),
						email: email.trim(),
						phone: phone.trim(),
						password,
						role,
					}),
				},
			)

			const data = await response.json()

			if (!response.ok) {
				setError(
					data.error ??
						'Something went wrong.',
				)
				setIsSubmitting(false)
				return
			}

			setSuccessMessage(
				'Registered successfully! Redirecting to login...',
			)

			setTimeout(() => {
				router.push('/login')
			}, 1200)
		} catch (error) {
			console.error(
				'Registration error:',
				error,
			)

			setError(
				'Could not reach the server. Please try again.',
			)
			setIsSubmitting(false)
		}
	}

	return (
		<main className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white px-4 py-6 sm:px-6 lg:px-10">
			{/* Google Identity Services */}
			{GOOGLE_CLIENT_ID && (
				<Script
					src="https://accounts.google.com/gsi/client"
					strategy="afterInteractive"
					onReady={() => setGoogleReady(true)}
				/>
			)}

			{/* Header */}
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

			{/* Registration Card */}
			<div className="mx-auto mt-8 max-w-2xl rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-[0_30px_70px_rgba(30,41,59,0.1)] sm:p-10">
				<div className="text-center">
					<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">
						Create Your Account
					</h1>

					<p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
						Join StayMatch and find the perfect
						accommodation for your studies.
					</p>
				</div>

				<form
					className="mt-8 space-y-5"
					onSubmit={handleSubmit}
				>
					{/* Success message */}
					{successMessage && (
						<div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">
							{successMessage}
						</div>
					)}

					{/* Error message */}
					{error && (
						<div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
							{error}
						</div>
					)}

					{/* Google account authenticated - collect role */}
					{pendingGoogleToken && (
						<div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
							<p className="text-sm font-bold text-slate-900">
								Complete your Google registration
							</p>

							<p className="mt-1 text-xs leading-5 text-slate-500">
								Your Google account has been verified.
								Please select your account type to
								continue.
							</p>
						</div>
					)}

					{/* Role */}
					<Field label="Select Your Role">
						<div className="relative">
							<button
								type="button"
								onClick={() =>
									setRoleOpen(
										(open) => !open,
									)
								}
								disabled={isSubmitting}
								className="flex w-full items-center gap-3 rounded-xl border border-blue-300 bg-white py-3 pl-4 pr-4 text-left text-sm outline-none ring-4 ring-blue-100 transition disabled:cursor-not-allowed disabled:opacity-60"
							>
								<User className="h-4 w-4 shrink-0 text-slate-400" />

								<span
									className={
										selectedRole
											? 'flex-1 font-medium text-slate-900'
											: 'flex-1 text-slate-400'
									}
								>
									{selectedRole
										? selectedRole.label
										: 'Choose your role'}
								</span>

								<ChevronDown
									className={`h-4 w-4 shrink-0 text-slate-400 transition ${
										roleOpen
											? 'rotate-180'
											: ''
									}`}
								/>
							</button>

							{roleOpen && (
								<div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
									{roleOptions.map(
										(option) => {
											const OptionIcon =
												option.icon

											const isSelected =
												option.value ===
												role

											return (
												<button
													type="button"
													key={
														option.value
													}
													onClick={() => {
														setRole(
															option.value,
														)
														setRoleOpen(
															false,
														)
														setError(
															'',
														)
													}}
													className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition ${
														isSelected
															? 'bg-blue-50 font-semibold text-blue-600'
															: 'font-medium text-slate-700 hover:bg-slate-50'
													}`}
												>
													<OptionIcon className="h-4 w-4" />
													{
														option.label
													}
												</button>
											)
										},
									)}
								</div>
							)}
						</div>
					</Field>

					{/* Full Name */}
					<Field label="Full Name">
						<InputShell icon={User}>
							<input
								type="text"
								value={name}
								onChange={(event) =>
									setName(
										event.target.value,
									)
								}
								placeholder="Enter your full name"
								required={!pendingGoogleToken}
								disabled={isSubmitting}
								className={`${inputClasses} disabled:opacity-60`}
							/>
						</InputShell>
					</Field>

					{/* Email */}
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
								required={!pendingGoogleToken}
								disabled={isSubmitting}
								className={`${inputClasses} disabled:opacity-60`}
							/>
						</InputShell>
					</Field>

					{/* Phone */}
					<Field label="Phone Number">
						<InputShell icon={Phone}>
							<input
								type="tel"
								value={phone}
								onChange={(event) =>
									setPhone(
										event.target.value,
									)
								}
								placeholder="+266 XXX XXX"
								disabled={isSubmitting}
								className={`${inputClasses} disabled:opacity-60`}
							/>
						</InputShell>
					</Field>

					{/* Password */}
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
								placeholder="Create a strong password"
								required={!pendingGoogleToken}
								disabled={isSubmitting}
								className={`${inputClasses} pr-11 disabled:opacity-60`}
							/>

							<button
								type="button"
								onClick={() =>
									setShowPassword(
										(show) => !show,
									)
								}
								disabled={isSubmitting}
								className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 disabled:opacity-50"
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

					{/* Confirm Password */}
					<Field label="Confirm Password">
						<div className="relative">
							<Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

							<input
								type={
									showConfirm
										? 'text'
										: 'password'
								}
								value={confirmPassword}
								onChange={(event) =>
									setConfirmPassword(
										event.target.value,
									)
								}
								placeholder="Confirm your password"
								required={!pendingGoogleToken}
								disabled={isSubmitting}
								className={`${inputClasses} pr-11 disabled:opacity-60`}
							/>

							<button
								type="button"
								onClick={() =>
									setShowConfirm(
										(show) => !show,
									)
								}
								disabled={isSubmitting}
								className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 disabled:opacity-50"
								aria-label={
									showConfirm
										? 'Hide password'
										: 'Show password'
								}
							>
								{showConfirm ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</button>
						</div>
					</Field>

					{/* Terms */}
					<label className="flex items-start gap-3 text-sm text-slate-500">
						<input
							type="checkbox"
							checked={agreed}
							onChange={(event) =>
								setAgreed(
									event.target.checked,
								)
							}
							disabled={isSubmitting}
							className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
						/>

						<span>
							I agree to the{' '}
							<span className="font-semibold text-blue-600">
								Terms of Service
							</span>{' '}
							and{' '}
							<span className="font-semibold text-blue-600">
								Privacy Policy
							</span>
							.
						</span>
					</label>

					{/* Complete Google Registration */}
					{pendingGoogleToken ? (
						<button
							type="button"
							onClick={
								handleCompleteGoogleRegistration
							}
							disabled={isSubmitting}
							className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isSubmitting
								? 'Creating account...'
								: 'Complete Registration'}

							{!isSubmitting && (
								<ArrowRight className="h-4 w-4" />
							)}
						</button>
					) : (
						<>
							{/* Normal Registration */}
							<button
								type="submit"
								disabled={isSubmitting}
								className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{isSubmitting
									? 'Creating account...'
									: 'Create Account'}

								{!isSubmitting && (
									<ArrowRight className="h-4 w-4" />
								)}
							</button>

							{/* Divider */}
							<div className="flex items-center gap-4 text-xs font-medium text-slate-400">
								<span className="h-px flex-1 bg-slate-200" />
								or
								<span className="h-px flex-1 bg-slate-200" />
							</div>

							{/* Google Registration */}
							<button
								type="button"
								onClick={handleGoogleClick}
								disabled={isSubmitting}
								className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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

								{isSubmitting
									? 'Connecting to Google...'
									: 'Sign up with Google'}
							</button>
						</>
					)}

					{/* Login */}
					<p className="text-center text-sm text-slate-500">
						Already have an account?{' '}
						<Link
							href="/login"
							className="font-semibold text-blue-600 hover:text-blue-700"
						>
							Log in
						</Link>
					</p>
				</form>
			</div>
		</main>
	)
}

export default RegisterUser