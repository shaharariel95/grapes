import { defineEventHandler, getQuery, createError } from 'h3'
import { useD1 } from '../db/d1'

export default defineEventHandler(async (event) => {
    const db = useD1(event)
    const query = getQuery(event)
    const id = query.id

    // Validate required fields
    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Entry ID is required',
        })
    }

    try {
        // Delete entry from D1
        const result = await db.prepare(
            'DELETE FROM Entries WHERE id = ?'
        ).bind(id).run()

        // Check if entry was found and deleted
        if (result.meta.changes === 0) {
            throw createError({
                statusCode: 404,
                message: 'Entry not found',
            })
        }

        return {
            success: true,
            message: 'Entry deleted successfully'
        }
    } catch (error) {
        console.error('D1 DELETE Error:', error)
        if (error.statusCode) throw error
        throw createError({
            statusCode: 500,
            message: 'Failed to delete entry from database',
        })
    }
})
