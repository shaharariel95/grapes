import { defineEventHandler, createError } from 'h3'
import { useD1 } from '../db/d1' // Note the change to '../db/d1' (no .ts extension needed)

export default defineEventHandler(async (event) => {
    const db = useD1(event)

    try {
        // Note: We no longer specify the generic type <Entry> here in JS.
        const { results } = await db.prepare(
            'SELECT * FROM Entries ORDER BY time DESC'
        ).all()

        return { entries: results || [] }
    } catch (error) {
        console.error('D1 GET Error:', error)
        // Throw an H3 error that Nuxt can handle gracefully
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch entries from the "grapes" database.',
        })
    }
})