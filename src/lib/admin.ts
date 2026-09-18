import { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function isAdmin(request: NextRequest): boolean {
    const token = request.cookies.get('staymatch_token')?.value

    if (!token) {
        return false
    }

    const payload = verifyToken(token)

    if (!payload) {
        return false
    }

    return payload.role === 'ADMINISTRATOR'
}