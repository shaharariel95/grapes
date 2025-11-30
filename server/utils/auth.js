import { createError, getCookie, setCookie, deleteCookie } from 'h3'

const AUTH_COOKIE_NAME = 'auth_token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

// Get the auth secret from runtime config
function getAuthSecret(event) {
  const config = useRuntimeConfig(event)
  const secret = config.authSecret
  
  // In production, AUTH_SECRET must be set to a secure value
  if (!secret) {
    throw new Error('AUTH_SECRET environment variable is required')
  }
  
  return secret
}

// Simple password hashing using Web Crypto API (available in Cloudflare Workers)
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(plainPassword, hashedPassword) {
  const hash = await hashPassword(plainPassword)
  return hash === hashedPassword
}

// For creating the default user password hash if needed manually
export async function generateHash(password) {
    return await hashPassword(password)
}

// HMAC-SHA256 signing using Web Crypto API
async function signData(data, event) {
  const secret = getAuthSecret(event)
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  )
  const hashArray = Array.from(new Uint8Array(signature))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Verify HMAC signature
async function verifySignature(data, signature, event) {
  const expectedSignature = await signData(data, event)
  return expectedSignature === signature
}

export async function setAuthCookie(event, user) {
    // Create payload with expiration time
    const expiresAt = Date.now() + (COOKIE_MAX_AGE * 1000)
    const payload = JSON.stringify({ 
      id: user.id, 
      username: user.username,
      exp: expiresAt
    })
    
    // Sign the payload with HMAC
    const signature = await signData(payload, event)
    const token = btoa(payload) + '.' + signature

    setCookie(event, AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/'
    })
}

export async function getAuthUser(event) {
    const token = getCookie(event, AUTH_COOKIE_NAME)
    if (!token) return null

    try {
        const [b64Payload, signature] = token.split('.')
        if (!b64Payload || !signature) return null

        // Verify signature
        const payload = atob(b64Payload)
        const isValid = await verifySignature(payload, signature, event)
        if (!isValid) return null

        const data = JSON.parse(payload)
        
        // Check expiration
        if (data.exp && Date.now() > data.exp) {
          return null
        }

        return { id: data.id, username: data.username }
    } catch (e) {
        return null
    }
}

export function clearAuthCookie(event) {
    deleteCookie(event, AUTH_COOKIE_NAME)
}

export async function requireAuth(event) {
    const user = await getAuthUser(event)
    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        })
    }
    return user
}

