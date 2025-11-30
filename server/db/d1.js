import { createError } from 'h3'

// Function to safely get the D1 binding from the event context
export function useD1(event) {
    // Access the DB binding via the Cloudflare environment context
    const db = event.context.cloudflare.env.DB

    if (!db) {
        throw createError({
            statusCode: 500,
            message: 'Cloudflare D1 binding "DB" (for "grapes") not found. Check your Nuxt and Wrangler configurations.'
        })
    }
    return db
}