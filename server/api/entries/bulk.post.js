import { defineEventHandler, readBody, createError } from 'h3'
import { useD1 } from '../../db/d1'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    await requireAuth(event)
    const db = useD1(event)
    const body = await readBody(event)

    if (!Array.isArray(body) || body.length === 0) {
        throw createError({
            statusCode: 400,
            message: 'Request body must be a non-empty array of entries',
        })
    }

    // Prepare the statement
    const stmt = db.prepare(
        `INSERT INTO Entries (time, feedingAmount, sensor, glucometerReading, drip, nutritionType, extra) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`
    )

    // Create the batch of statements
    const batch = body.map(entry => {
        // Basic validation for each entry
        if (!entry.time) {
            // We could throw here, or skip. For now let's skip invalid entries or handle them?
            // But batch execution usually fails all if one fails. 
            // Let's assume the frontend filters valid entries, but we should ensure 'time' exists.
            // If time is missing, we can't insert. 
            // Let's fallback to current time? No, that's bad for history.
            // Let's throw if any entry is invalid to ensure data integrity of the batch.
            throw createError({
                statusCode: 400,
                message: 'Entry missing required field: time'
            })
        }

        return stmt.bind(
            entry.time,
            entry.feedingAmount || null,
            entry.sensor || null,
            entry.glucometerReading || null,
            entry.drip || null,
            entry.nutritionType || null,
            entry.extra || null
        )
    })

    try {
        const results = await db.batch(batch)
        return {
            success: true,
            count: results.length
        }
    } catch (error) {
        console.error('D1 Bulk Insert Error:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to bulk insert entries: ' + error.message,
        })
    }
})
