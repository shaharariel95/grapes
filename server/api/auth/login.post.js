import { defineEventHandler, readBody, createError, getRequestHeader } from 'h3'
import { useD1 } from '../../db/d1'
import { verifyPassword, setAuthCookie } from '../../utils/auth'
import { checkRateLimit, resetRateLimit } from '../../utils/rate-limit'

export default defineEventHandler(async (event) => {
    const { username, password } = await readBody(event)
    const db = useD1(event)

    if (!username || !password) {
        throw createError({
            statusCode: 400,
            message: 'Username and password are required'
        })
    }

    // Rate limiting based on IP address
    const ip = getRequestHeader(event, 'cf-connecting-ip') || 
               getRequestHeader(event, 'x-forwarded-for') || 
               'unknown'
    
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
        throw createError({
            statusCode: 429,
            message: `Too many login attempts. Please try again in ${rateLimit.resetIn} minutes.`
        })
    }

    const result = await db.prepare('SELECT * FROM Users WHERE username = ?').bind(username).first()

    if (!result) {
        throw createError({
            statusCode: 401,
            message: 'Invalid credentials'
        })
    }

    const isValid = await verifyPassword(password, result.password)

    if (!isValid) {
        throw createError({
            statusCode: 401,
            message: 'Invalid credentials'
        })
    }

    // Reset rate limit on successful login
    resetRateLimit(ip)

    await setAuthCookie(event, { id: result.id, username: result.username })

    return { success: true }
})
