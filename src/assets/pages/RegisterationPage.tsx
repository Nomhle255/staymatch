import { useState, type ReactNode, type ComponentType } from 'react'
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

function RegisterPage() {
	const [roleOpen, setRoleOpen] = useState(false)
	const [role, setRole] = useState<Role | null>(null)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)

	const selectedRole = roleOptions.find((option) => option.value === role)

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
				<p className="text-sm text-slate-500">
					Already have an account?{' '}
					<a href="#login" className="font-semibold text-blue-600 hover:text-blue-700">
						Log in
					</a>
				</p>
			</div>

			<div className="mx-auto mt-8 max-w-2xl rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-[0_30px_70px_rgba(30,41,59,0.1)] sm:p-10">
				<div className="text-center">
					<h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">
						Create Your Account
					</h1>
					<p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
						Join StayMatch and find the perfect accommodation for your studies.
					</p>
				</div>

				<form className="mt-8 space-y-5">
					<Field label="Select Your Role">
						<div className="relative">
							<button
								type="button"
								onClick={() => setRoleOpen((open) => !open)}
								className="flex w-full items-center gap-3 rounded-xl border border-blue-300 bg-white py-3 pl-4 pr-4 text-left text-sm outline-none ring-4 ring-blue-100 transition"
							>
								<User className="h-4 w-4 shrink-0 text-slate-400" />
								<span className={selectedRole ? 'flex-1 font-medium text-slate-900' : 'flex-1 text-slate-400'}>
									{selectedRole ? selectedRole.label : 'Choose your role'}
								</span>
								<ChevronDown
									className={`h-4 w-4 shrink-0 text-slate-400 transition ${roleOpen ? 'rotate-180' : ''}`}
								/>
							</button>

							{roleOpen && (
								<div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
									{roleOptions.map((option) => {
										const OptionIcon = option.icon
										const isSelected = option.value === role
										return (
											<button
												type="button"
												key={option.value}
												onClick={() => {
													setRole(option.value)
													setRoleOpen(false)
												}}
												className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition ${
													isSelected
														? 'bg-blue-50 font-semibold text-blue-600'
														: 'font-medium text-slate-700 hover:bg-slate-50'
												}`}
											>
												<OptionIcon className="h-4 w-4" />
												{option.label}
											</button>
										)
									})}
								</div>
							)}
						</div>
					</Field>

					<Field label="Full Name">
						<InputShell icon={User}>
							<input type="text" placeholder="Enter your full name" className={inputClasses} />
						</InputShell>
					</Field>

					<Field label="Email Address">
						<InputShell icon={Mail}>
							<input type="email" placeholder="Enter your email address" className={inputClasses} />
						</InputShell>
					</Field>

					<Field label="Phone Number">
						<InputShell icon={Phone}>
							<input type="tel" placeholder="+266 XXX XXX" className={inputClasses} />
						</InputShell>
					</Field>

					<Field label="Password">
						<div className="relative">
							<Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
							<input
								type={showPassword ? 'text' : 'password'}
								placeholder="Create a strong password"
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

					<Field label="Confirm Password">
						<div className="relative">
							<Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
							<input
								type={showConfirm ? 'text' : 'password'}
								placeholder="Confirm your password"
								className={`${inputClasses} pr-11`}
							/>
							<button
								type="button"
								onClick={() => setShowConfirm((show) => !show)}
								className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
								aria-label={showConfirm ? 'Hide password' : 'Show password'}
							>
								{showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</button>
						</div>
					</Field>

					<label className="flex items-start gap-3 text-sm text-slate-600">
						<input
							type="checkbox"
							className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
						/>
						<span>
							I agree to the{' '}
							<a href="#" className="font-semibold text-blue-600 hover:text-blue-700">
								Terms of Service
							</a>{' '}
							and{' '}
							<a href="#" className="font-semibold text-blue-600 hover:text-blue-700">
								Privacy Policy
							</a>
						</span>
					</label>

					<button
						type="submit"
						className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700"
					>
						Create Account
						<ArrowRight className="h-4 w-4" />
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
						Sign up with Google
					</button>

					<p className="text-center text-sm text-slate-500">
						Already have an account?{' '}
						<a href="#login" className="font-semibold text-blue-600 hover:text-blue-700">
							Log in
						</a>
					</p>
				</form>
			</div>
		</main>
	)
}

export default RegisterPage