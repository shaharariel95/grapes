// server/utils/auth.js

import { createError, getCookie, setCookie, deleteCookie } from 'h3'

// --- CONSTANTS ---
const AUTH_COOKIE_NAME = 'auth_token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

// --- HELPER FUNCTIONS ---

// Simple password hashing using Web Crypto API (available in Cloudflare Workers)
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  // Converts hash array to a hex string
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// HMAC-SHA256 signing using Web Crypto API
// ❗ Takes the secret string directly, avoiding runtime calls in global scope.
async function signData(data, secret) {
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
async function verifySignature(data, signature, secret) {
  const expectedSignature = await signData(data, secret)
  return expectedSignature === signature
}


// --- EXPORTED FUNCTIONS ---

/**
 * Retrieves the Auth Secret from runtime config and validates its existence.
 */
function getAuthSecret(event) {
  // ✅ FIX: useRuntimeConfig() is called inside a function that requires 
  // the event, ensuring it only runs during a request lifecycle.
  const config = useRuntimeConfig(event)
  const secret = config.authSecret
  
  if (!secret) {
    throw new Error('AUTH_SECRET environment variable is required in nuxt.config.js')
  }
  
  return secret
}


export async function verifyPassword(plainPassword, hashedPassword) {
  const hash = await hashPassword(plainPassword)
  return hash === hashedPassword
}

export async function generateHash(password) {
  return await hashPassword(password)
}

export async function setAuthCookie(event, user) {
    const secret = getAuthSecret(event) // 🔑 Get secret inside the request handler
    
    // Create payload with expiration time
    const expiresAt = Date.now() + (COOKIE_MAX_AGE * 1000)
    const payload = JSON.stringify({ 
      id: user.id, 
      username: user.username,
      exp: expiresAt
    })
    
    // Sign the payload with HMAC
    const signature = await signData(payload, secret) // 🔑 Pass secret to the helper
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
        const secret = getAuthSecret(event) // 🔑 Get secret inside the request handler
        
        const [b64Payload, signature] = token.split('.')
        if (!b64Payload || !signature) return null

        // Verify signature
        const payload = atob(b64Payload)
        const isValid = await verifySignature(payload, signature, secret) // 🔑 Pass secret to the helper
        if (!isValid) return null

        const data = JSON.parse(payload)
        
        // Check expiration
        if (data.exp && Date.now() > data.exp) {
          return null
        }

        return { id: data.id, username: data.username }
    } catch (e) {
        // Log the error in production for debugging, but return null to client
        console.error('Failed to parse or verify auth token:', e)
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