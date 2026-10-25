import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Roles a person is allowed to pick when registering.
export async function GET() {
	try {
		const roles = await prisma.role.findMany({
			where: { selfAssignable: true },
			select: { name: true, label: true },
			orderBy: { label: 'asc' },
		})

		return NextResponse.json({ roles })
	} catch (error) {
		console.error('Roles error:', error)
		return NextResponse.json(
			{ error: 'Could not load roles.' },
			{ status: 500 },
		)
	}
}