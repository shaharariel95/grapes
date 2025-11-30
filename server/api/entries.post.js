import { defineEventHandler, readBody, createError } from 'h3'
import { useD1 } from '../db/d1'
import { requireAuth } from '../utils/auth'

export default defineEventHandler(async (event) => {
    await requireAuth(event)
    const db = useD1(event)
    const body = await readBody(event)

    // Validate required fields
    if (!body.time) {
        throw createError({
            statusCode: 400,
            message: 'Time field is required',
        })
    }

    try {
        // Insert new entry into D1
        const result = await db.prepare(
            `INSERT INTO Entries (time, feedingAmount, sensor, glucometerReading, drip, nutritionType, extra) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            body.time,
            body.feedingAmount || null,
            body.sensor || null,
            body.glucometerReading || null,
            body.drip || null,
            body.nutritionType || null,
            body.extra || null
        ).run()

        // Get the inserted entry with its ID
        const { results } = await db.prepare(
            'SELECT * FROM Entries WHERE id = ?'
        ).bind(result.meta.last_row_id).all()

        return {
            success: true,
            entry: results[0]
        }
    } catch (error) {
        console.error('D1 POST Error:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to create entry in database',
        })
    }
})
