import { defineEventHandler, createError, getQuery } from 'h3'
import { useD1 } from '../db/d1'
import { requireAuth } from '../utils/auth'

export default defineEventHandler(async (event) => {
    await requireAuth(event)
    const db = useD1(event)
    const query = getQuery(event)

    // Parse pagination parameters
    const limit = parseInt(query.limit) || 100
    const offset = parseInt(query.offset) || 0

    // Validate pagination parameters
    if (limit < 1 || limit > 1000) {
        throw createError({
            statusCode: 400,
            message: 'Limit must be between 1 and 1000'
        })
    }

    if (offset < 0) {
        throw createError({
            statusCode: 400,
            message: 'Offset must be non-negative'
        })
    }

    try {
        const { results } = await db.prepare(
            'SELECT * FROM Entries ORDER BY time DESC LIMIT ? OFFSET ?'
        ).bind(limit, offset).all()

        // Get total count for pagination
        const { results: countResult } = await db.prepare(
            'SELECT COUNT(*) as total FROM Entries'
        ).all()

        return { 
            entries: results || [],
            total: countResult[0]?.total || 0,
            limit,
            offset
        }
    } catch (error) {
        console.error('D1 GET Error:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch entries from the database.',
        })
    }
})