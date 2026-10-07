import Link from 'next/link'

export default function AdminDashboard() {
    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold mb-8">
                Admin Dashboard
            </h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Link
                    href="/admin/universities"
                    className="rounded-lg border p-6 hover:bg-gray-50"
                >
                    <h2 className="text-xl font-semibold">
                        Manage Universities
                    </h2>

                    <p className="mt-2 text-gray-600">
                        Add and manage universities and their coordinates.
                    </p>
                </Link>
            </div>
        </main>
    )
}