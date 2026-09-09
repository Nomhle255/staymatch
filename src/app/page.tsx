import Link from 'next/link'

const landlordHighlights = [
  'Publish a listing with rent, utilities, and availability details',
  'Reach students already searching for your area and university zone',
  'See which listings are ready for verification and follow-up',
]


const processSteps = [
  {
    title: 'Set your search profile',
    description: 'Students save their preferred budget, area, room type, and move-in window once.',
  },
  {
    title: 'List or browse accommodations',
    description: 'Landlords publish verified homes while students filter only what matters.',
  },
  {
    title: 'Get matched and notified',
    description: 'The system highlights the best fit and notifies students about new matches.',
  },
]

function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-16 pt-5 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-slate-200/70 bg-white/70 px-4 py-4 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between md:rounded-2xl md:border md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20">
            ⌂
          </div>
          <div>
            <p className="text-lg font-extrabold text-slate-900">StayMatch</p>
            <p className="text-sm text-slate-500">Student and landlord accommodation hub</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-5 text-sm font-medium text-slate-600" aria-label="Primary">
          <Link className="transition hover:text-blue-600" href="/register">For Students</Link>
          <Link className="transition hover:text-blue-600" href="/register">For Landlords</Link>
          <a className="transition hover:text-blue-600" href="#how-it-works">How it Works</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
            href="/login"
          >
            Sign In
          </Link>
        </div>
      </header>

      <section
        className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/80 px-5 py-14 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
            Centralized off-campus accommodation search
          </p>
          <h1 className="text-4xl font-black tracking-[-0.06em] text-slate-950 sm:text-5xl lg:text-6xl">
            Find the right
            <span className="block text-blue-600">off-campus home</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-500 sm:text-lg">
            StayMatch helps students discover verified accommodations near campus while helping
            landlords publish listings that reach the right audience.
          </p>
        </div>

        <div className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-3">
          <Link
            className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
            href="/register"
          >
            Register now
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">For Students</p>
          <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
            Search, compare, and get alerted when a room matches your profile.
          </h2>
          <p className="mt-3 text-slate-600">
            Compare verified options and move into the dedicated student view later when you're
            ready to save requirements and alerts.
          </p>
        </article>

        <article id="landlords" className="rounded-[1.75rem] border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">For Landlords</p>
          <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
            Publish verified listings and reach students actively searching nearby.
          </h2>
          <p className="mt-3 text-slate-600">
            List rooms, set availability, and get visibility among students whose saved
            requirements already match your property.
          </p>

          <ul className="mt-5 space-y-3">
            {landlordHighlights.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-2xl bg-white/80 p-4 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200/70"
              >
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section id="how-it-works" className="mt-8" aria-label="How it works">
        <aside className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">How it works</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <div key={step.title} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    0{index + 1}
                  </span>
                  <h3 className="text-base font-bold text-slate-950">{step.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  )
}

export default HomePage