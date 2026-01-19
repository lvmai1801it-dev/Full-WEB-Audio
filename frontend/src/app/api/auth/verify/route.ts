import { NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

// GET /api/auth/verify - Verify current token
export async function GET(request: NextRequest) {
    const payload = verifyAuth(request);

    if (!payload) {
        return unauthorizedResponse('Invalid or expired token');
    }

    return Response.json({
        valid: true,
        user: {
            id: payload.sub,
            username: payload.username,
        },
    });
}
