import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

type RouteContext = {
    params: Promise<{ id: string }>
}

// POST /api/admin/accommodation/[id]/review
// Body: { comment: string, markIncomplete?: boolean }
// Saves an admin comment on the listing. When markIncomplete is true,
// the listing is also set to INACTIVE so students no longer see it.
export async function POST(request: NextRequest, { params }: RouteContext) {
    try {
        const token = request.cookies.get('staymatch_token')?.value
        const payload = token ? verifyToken(token) : null

        if (!payload) {
            return NextResponse.json(
                { error: 'You must be logged in.' },
                { status: 401 },
            )
        }

        // Check the role in the database, not only in the token.
        const admin = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { role: { select: { name: true } } },
        })

        if (!admin || admin.role.name !== 'ADMINISTRATOR') {
            return NextResponse.json(
                { error: 'Only administrators can review accommodations.' },
                { status: 403 },
            )
        }

        let body: { comment?: unknown; markIncomplete?: unknown }

        try {
            body = await request.json()
        } catch {
            return NextResponse.json(
                { error: 'Please provide valid JSON.' },
                { status: 400 },
            )
        }

        const comment =
            typeof body.comment === 'string' ? body.comment.trim() : ''

        if (!comment) {
            return NextResponse.json(
                { error: 'Please write a comment explaining what is missing.' },
                { status: 400 },
            )
        }

        if (comment.length > 1000) {
            return NextResponse.json(
                { error: 'Your comment must be 1000 characters or fewer.' },
                { status: 400 },
            )
        }

        const markIncomplete = body.markIncomplete === true

        const { id } = await params

        const existing = await prisma.accommodation.findUnique({
            where: { id },
            select: { id: true },
        })

        if (!existing) {
            return NextResponse.json(
                { error: 'Accommodation not found.' },
                { status: 404 },
            )
        }

        const accommodation = await prisma.accommodation.update({
            where: { id },
            data: {
                adminNote: comment,
                adminNoteAt: new Date(),
                ...(markIncomplete ? { status: 'INACTIVE' as const } : {}),
            },
            select: {
                id: true,
                status: true,
                adminNote: true,
                adminNoteAt: true,
            },
        })

        return NextResponse.json({ accommodation })
    } catch (error) {
        console.error('Review accommodation error:', error)

        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 },
        )
    }
}