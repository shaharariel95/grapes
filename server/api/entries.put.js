import { defineEventHandler, readBody, createError } from 'h3'
import { useD1 } from '../db/d1'
import { requireAuth } from '../utils/auth'

export default defineEventHandler(async (event) => {
    await requireAuth(event)
    const db = useD1(event)
    const body = await readBody(event)

    // Validate required fields
    if (!body.id) {
        throw createError({
            statusCode: 400,
            message: 'Entry ID is required',
        })
    }

    if (!body.time) {
        throw createError({
            statusCode: 400,
            message: 'Time field is required',
        })
    }

    try {
        // Update entry in D1
        const result = await db.prepare(
            `UPDATE Entries 
             SET time = ?, feedingAmount = ?, sensor = ?, glucometerReading = ?, 
                 drip = ?, nutritionType = ?, extra = ?
             WHERE id = ?`
        ).bind(
            body.time,
            body.feedingAmount || null,
            body.sensor || null,
            body.glucometerReading || null,
            body.drip || null,
            body.nutritionType || null,
            body.extra || null,
            body.id
        ).run()

        // Check if entry was found and updated
        if (result.meta.changes === 0) {
            throw createError({
                statusCode: 404,
                message: 'Entry not found',
            })
        }

        // Get the updated entry
        const { results } = await db.prepare(
            'SELECT * FROM Entries WHERE id = ?'
        ).bind(body.id).all()

        return {
            success: true,
            entry: results[0]
        }
    } catch (error) {
        console.error('D1 PUT Error:', error)
        if (error.statusCode) throw error
        throw createError({
            statusCode: 500,
            message: 'Failed to update entry in database',
        })
    }
})
