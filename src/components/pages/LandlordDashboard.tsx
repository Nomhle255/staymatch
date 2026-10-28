'use client'
import type { ReactNode, ComponentType } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    LayoutDashboard,
    Home,
    PlusCircle,
    LogOut,
    MapPin,
    User,
    Menu,
    X,
    Image as ImageIcon,
} from 'lucide-react'
type Accommodation = {
    id: string
    roomIdentifier: string
    description: string
    area: string
    price: number
    propertyType: string
    amenities: string[]
    photos: string[]
    availableFrom: string | null
    status: string
    latitude: number
    longitude: number
    createdAt: string
    updatedAt: string
}
const navItems = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        active: true,
        href: '/landlord/dashboard',
    },
    {
        label: 'My Listings',
        icon: Home,
        active: false,
        href: '/landlord/accommodationlisting',
    },
    {
        label: 'Add Listing',
        icon: PlusCircle,
        active: false,
        href: '/landlord/addaccommodation',
    },
    {
        label: 'Profile',
        icon: User,
        active: false,
        href: '/profile',
    },
]

function getPropertyTypeLabel(propertyType: string) {
    switch (propertyType) {
        case 'SINGLE_ROOM':
            return 'Single Room'
        case 'DOUBLE':
            return 'Double'
        case 'COMMUNE':
            return 'Commune'
        case 'BACHELOR':
            return 'Bachelor'
        default:
            return propertyType
    }
}

function NavButton({
    label,
    icon: Icon,
    active,
    href,
    onClick,
}: {
    label: string
    icon: ComponentType<{ className?: string }>
    active: boolean
    href: string
    onClick?: () => void
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
        >
            <Icon className="h-4 w-4" />
            {label}
        </Link>
    )
}
function StatCard({
    label,
    value,
    icon: Icon,
    tint,
}: {
    label: string
    value: string
    icon: ComponentType<{ className?: string }>
    tint: string
}) {
    return (
        <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm sm:p-5">
            <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}
            >
                <Icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-2xl font-black tracking-[-0.03em] text-slate-950">
                {value}
            </p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
        </div>
    )
}
function SidebarShell({ children }: { children: ReactNode }) {
    return (
        <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-200/70 bg-white px-4 py-6 lg:flex">
            {children}
        </aside>
    )
}

/*
 * Top bar for screens smaller than lg, where the sidebar is hidden.
 * It holds the logo, a menu button, and a dropdown with the same
 * navigation, landlord card, and log out link as the sidebar.
 */
function MobileNav({
    displayName,
    landlordInitial,
    landlordLoading,
}: {
    displayName: string
    landlordInitial: string
    landlordLoading: boolean
}) {
    const [open, setOpen] = useState(false)

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white lg:hidden">
            <div className="flex items-center justify-between px-4 py-3">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-base font-bold text-white shadow-lg shadow-blue-600/25">
                        ⌂
                    </div>
                    <p className="text-lg font-black tracking-[-0.03em] text-slate-950">
                        Stay<span className="text-blue-600">Match</span>
                    </p>
                </Link>

                <button
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100"
                >
                    {open ? (
                        <X className="h-5 w-5" />
                    ) : (
                        <Menu className="h-5 w-5" />
                    )}
                </button>
            </div>

            {open && (
                <div
                    id="mobile-menu"
                    className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-100 px-4 pb-4 pt-3"
                >
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <NavButton
                                key={item.label}
                                {...item}
                                onClick={() => setOpen(false)}
                            />
                        ))}
                    </nav>

                    <div className="mt-3 rounded-2xl bg-slate-50 p-3">
                        <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
                                {landlordLoading ? '...' : landlordInitial}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-900">
                                    {landlordLoading ? 'Loading...' : displayName}
                                </p>
                                <p className="text-xs text-slate-500">Landlord</p>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/"
                        className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                        <LogOut className="h-4 w-4" />
                        Log out
                    </Link>
                </div>
            )}
        </header>
    )
}

function LandlordDashboard() {
    const [landlordName, setLandlordName] = useState('')
    const [landlordLoading, setLandlordLoading] = useState(true)
    const [listings, setListings] = useState<Accommodation[]>([])
    const [loadingListings, setLoadingListings] = useState(true)
    const [listingsError, setListingsError] = useState('')
    const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)

    // Logged-in landlord's profile
    useEffect(() => {
        let mounted = true
        const fetchLandlordProfile = async () => {
            try {
                setLandlordLoading(true)
                const response = await fetch('/api/profile')
                // An HTML error page resolves to null instead of a JSON syntax error
                const data = await response.json().catch(() => null)
                if (!response.ok || !data) {
                    throw new Error(
                        data?.error ||
                            `Failed to load landlord profile (${response.status}).`,
                    )
                }
                if (!mounted) return
                setLandlordName(data.user?.name || '')
            } catch (error) {
                // The name only shows in the sidebar, so don't raise an error overlay
                console.warn('Failed to fetch landlord profile:', error)
                if (mounted) setLandlordName('')
            } finally {
                if (mounted) setLandlordLoading(false)
            }
        }
        fetchLandlordProfile()
        return () => {
            mounted = false
        }
    }, [])
    // Landlord's listings
    useEffect(() => {
        const fetchListings = async () => {
            try {
                setLoadingListings(true)
                setListingsError('')
                const response = await fetch('/api/accommodationlistings')
                const data = await response.json().catch(() => null)
                if (!response.ok || !data) {
                    throw new Error(
                        data?.error || 'Failed to load your accommodations.',
                    )
                }
                setListings(
                    (data.accommodations || []).map(
                        (accommodation: Accommodation) => ({
                            ...accommodation,
                            roomIdentifier: accommodation.roomIdentifier || '',
                            // Make sure photos is always an array
                            photos: Array.isArray(accommodation.photos)
                                ? accommodation.photos
                                : [],
                        }),
                    ),
                )
            } catch (error) {
                console.error('Failed to fetch dashboard listings:', error)
                setListingsError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to load your accommodations.',
                )
            } finally {
                setLoadingListings(false)
            }
        }
        fetchListings()
    }, [])
    const updateListingStatus = async (
        listingId: string,
        status: 'AVAILABLE' | 'OCCUPIED',
    ) => {
        try {
            setUpdatingStatusId(listingId)
            setListingsError('')
            const response = await fetch(
                `/api/accommodationlistings/${listingId}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status }),
                },
            )
            const data = await response.json().catch(() => null)
            if (!response.ok || !data) {
                throw new Error(data?.error || 'Failed to update listing status.')
            }
            setListings((currentListings) =>
                currentListings.map((listing) =>
                    listing.id === listingId ? { ...listing, status } : listing,
                ),
            )
        } catch (error) {
            setListingsError(
                error instanceof Error
                    ? error.message
                    : 'Failed to update listing status.',
            )
        } finally {
            setUpdatingStatusId(null)
        }
    }
    const displayName = landlordName || 'Landlord'
    const landlordInitial = displayName.charAt(0).toUpperCase()
    const firstName = displayName.trim().split(/\s+/)[0] || 'Landlord'
    const stats = [
        {
            label: 'Your Listings',
            value: String(listings.length),
            icon: Home,
            tint: 'bg-blue-50 text-blue-600',
        },
        {
            label: 'Occupied Listings',
            value: String(
                listings.filter((listing) => listing.status === 'OCCUPIED').length,
            ),
            icon: Home,
            tint: 'bg-amber-50 text-amber-600',
        },
    ]
    return (
        <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
            {/* Mobile and tablet: top bar with a menu (the sidebar is hidden below lg) */}
            <MobileNav
                displayName={displayName}
                landlordInitial={landlordInitial}
                landlordLoading={landlordLoading}
            />

            {/* Sidebar */}
            <SidebarShell>
                <div>
                    <Link href="/" className="flex items-center gap-3 px-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/25">
                            ⌂
                        </div>
                        <p className="text-lg font-black tracking-[-0.03em] text-slate-950">
                            Stay<span className="text-blue-600">Match</span>
                        </p>
                    </Link>
                    <nav className="mt-8 space-y-1">
                        {navItems.map((item) => (
                            <NavButton key={item.label} {...item} />
                        ))}
                    </nav>
                </div>
                {/* Landlord Profile */}
                <div className="space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
                                {landlordLoading ? '...' : landlordInitial}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-900">
                                    {landlordLoading ? 'Loading...' : displayName}
                                </p>
                                <p className="text-xs text-slate-500">Landlord</p>
                            </div>
                        </div>
                    </div>
                    <Link
                        href="/"
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                        <LogOut className="h-4 w-4" />
                        Log out
                    </Link>
                </div>
            </SidebarShell>
            {/* Main Content */}
            <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-10">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="break-words text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">
                            Welcome back, {landlordLoading ? '...' : firstName}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Here&apos;s how your listings are performing.
                        </p>
                    </div>
                    <div className="flex w-full items-center gap-3 sm:w-auto">
                        <Link
                            href="/landlord/addaccommodation"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 sm:w-auto"
                        >
                            <PlusCircle className="h-4 w-4" />
                            Add Listing
                        </Link>
                    </div>
                </div>
                {/* Stats */}
                <div className="mt-5 grid gap-4 sm:mt-6 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => (
                        <StatCard key={stat.label} {...stat} />
                    ))}
                </div>
                {/* Listings */}
                <div className="mt-5 grid gap-6 sm:mt-6 xl:grid-cols-[1.6fr_1fr]">
                    <section className="min-w-0 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm sm:rounded-[1.75rem] sm:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">
                                Your listings
                            </h2>
                            <Link
                                href="/landlord/accommodationlisting"
                                className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-700"
                            >
                                Manage all
                            </Link>
                        </div>
                        <div className="mt-5 space-y-4">
                            {/* Loading */}
                            {loadingListings && (
                                <div className="rounded-2xl border border-slate-200/70 p-6 text-center">
                                    <p className="text-sm text-slate-500">
                                        Loading your accommodations...
                                    </p>
                                </div>
                            )}
                            {/* Error */}
                            {!loadingListings && listingsError && (
                                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5">
                                    <p className="text-sm font-medium text-red-600">
                                        {listingsError}
                                    </p>
                                </div>
                            )}
                            {/* No listings */}
                            {!loadingListings &&
                                !listingsError &&
                                listings.length === 0 && (
                                    <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center sm:p-8">
                                        <Home className="mx-auto h-8 w-8 text-slate-300" />
                                        <p className="mt-3 text-sm font-semibold text-slate-700">
                                            No accommodations yet
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Add your first accommodation to start
                                            receiving applications.
                                        </p>
                                        <Link
                                            href="/landlord/addaccommodation"
                                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
                                        >
                                            <PlusCircle className="h-4 w-4" />
                                            Add Accommodation
                                        </Link>
                                    </div>
                                )}
                            {/* Database listings */}
                            {!loadingListings &&
                                !listingsError &&
                                listings.slice(0, 3).map((listing) => (
                                    <div
                                        key={listing.id}
                                        className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 p-3 transition hover:border-blue-200 hover:shadow-md sm:flex-row sm:items-center sm:p-4"
                                    >
                                        {/* Photo, or a placeholder when none was uploaded */}
                                        <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 sm:h-24 sm:w-32">
                                            {listing.photos[0] ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={listing.photos[0]}
                                                    alt={`${getPropertyTypeLabel(
                                                        listing.propertyType,
                                                    )} in ${listing.area}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <ImageIcon className="h-8 w-8 text-white/80" />
                                                </div>
                                            )}
                                            {listing.photos.length > 1 && (
                                                <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-white">
                                                    {listing.photos.length} photos
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-base font-bold text-slate-950">
                                                    {getPropertyTypeLabel(
                                                        listing.propertyType,
                                                    )}
                                                </h3>
                                                {(listing.status === 'AVAILABLE' ||
                                                    listing.status === 'VERIFIED') && (
                                                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
                                                        {listing.status === 'VERIFIED'
                                                            ? 'Verified'
                                                            : 'Available'}
                                                    </span>
                                                )}
                                                {listing.status === 'OCCUPIED' && (
                                                    <span className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-600">
                                                        Occupied
                                                    </span>
                                                )}
                                                {listing.status === 'PENDING_REVIEW' && (
                                                    <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-600">
                                                        Pending review
                                                    </span>
                                                )}
                                                {listing.status === 'INACTIVE' && (
                                                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                            {listing.roomIdentifier && (
                                                <p className="mt-1 break-words text-sm font-semibold text-slate-700">
                                                    Room: {listing.roomIdentifier}
                                                </p>
                                            )}
                                            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                <span className="break-words">
                                                    {listing.area}
                                                </span>
                                            </p>
                                            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                                                <span className="font-bold text-slate-900">
                                                    M{listing.price.toLocaleString()} /
                                                    month
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default LandlordDashboard