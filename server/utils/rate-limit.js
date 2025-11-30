// Simple in-memory rate limiter for login attempts
// In production, consider using Cloudflare KV or Durable Objects for distributed rate limiting

const loginAttempts = new Map()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 5
const CLEANUP_INTERVAL = 60 * 60 * 1000 // 1 hour


// Cleanup function to remove old entries
function cleanupOldEntries() {
  const now = Date.now()
  for (const [key, data] of loginAttempts.entries()) {
    if (now - data.firstAttempt > RATE_LIMIT_WINDOW) {
      loginAttempts.delete(key)
    }
  }
}


export function checkRateLimit(identifier) {
  cleanupOldEntries()
  const now = Date.now()
  const attempts = loginAttempts.get(identifier)

  if (!attempts) {
    loginAttempts.set(identifier, {
      count: 1,
      firstAttempt: now
    })
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 }
  }

  // Reset if window has passed
  if (now - attempts.firstAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.set(identifier, {
      count: 1,
      firstAttempt: now
    })
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 }
  }

  // Increment attempt count
  attempts.count++

  if (attempts.count > MAX_ATTEMPTS) {
    const resetTime = attempts.firstAttempt + RATE_LIMIT_WINDOW
    const waitMinutes = Math.ceil((resetTime - now) / 60000)
    return { 
      allowed: false, 
      remaining: 0,
      resetIn: waitMinutes
    }
  }

  return { 
    allowed: true, 
    remaining: MAX_ATTEMPTS - attempts.count 
  }
}

export function resetRateLimit(identifier) {
  cleanupOldEntries()
  loginAttempts.delete(identifier)
}
