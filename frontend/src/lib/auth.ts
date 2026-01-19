import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';
const JWT_EXPIRY = '24h';

export interface JWTPayload {
    sub: string;
    username: string;
    role: string;
    iat?: number;
    exp?: number;
}

/**
 * Generate JWT token
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

/**
 * Extract Bearer token from Authorization header
 */
export function getBearerToken(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.slice(7);
}

/**
 * Verify request authentication
 * Returns payload if valid, null otherwise
 */
export function verifyAuth(request: NextRequest): JWTPayload | null {
    const token = getBearerToken(request);
    if (!token) return null;
    return verifyToken(token);
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message = 'Unauthorized') {
    return Response.json({ error: message }, { status: 401 });
}
