import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { Context } from 'hono'

const prisma = new PrismaClient()

const createAnniversarySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    date: z.string().datetime({ message: 'Invalid date format' }),
    categoryId: z.number().int().positive(),
    description: z.string().nullable(),
})

const updateAnniversarySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    date: z.string().datetime({ message: 'Invalid date format' }),
    categoryId: z.number().int().positive(),
    description: z.string().nullable(),
})

const anniversaryController = {
    // 全ての記念日を取得
    async getAll(c: Context) {
        const userId = c.get('userId')
        if (!userId) {
            return c.json({ error: 'User id is required' }, 400)
        }

        try {
            const anniversaries = await prisma.anniversary.findMany({
                where: { userId: parseInt(userId, 10) },
                include: { category: true },
            })

            return c.json(anniversaries || [], 200)
        } catch (error) {
            console.error(error)
            return c.json({ error: 'Failed to fetch anniversaries', details: error }, 500)
        }
    },

    // 記念日を作成
    async create(c: Context) {
        const parsed = createAnniversarySchema.safeParse(await c.req.json())
        if (!parsed.success) {
            const errors = parsed.error.errors.map((err) => ({
                message: err.message,
                path: err.path,
            }))
            return c.json({ error: 'Validation failed', details: errors }, 400)
        }

        const userId = c.get('userId')
        if (!userId) {
            return c.json({ error: 'User id is required' }, 400)
        }

        try {
            const { name, date, categoryId } = parsed.data
            const anniversary = await prisma.anniversary.create({
                data: {
                    userId: parseInt(userId, 10),
                    name,
                    date: new Date(date),
                    categoryId,
                },
            })
            return c.json(anniversary, 201)
        } catch (error) {
            console.error(error)
            return c.json({ error: 'Failed to create anniversaries', details: error }, 500)
        }
    },

    // 特定の記念日を取得
    async get(c: Context) {
        const userId = c.get('userId')
        if (!userId) {
            return c.json({ error: 'User id is required' }, 400)
        }
        const id = parseInt(c.req.param('id'), 10)

        try {
            const anniversary = await prisma.anniversary.findFirst({
                where: { id, userId: parseInt(userId, 10) },
                include: { category: true },
            })
            if (!anniversary) {
                return c.json({ error: 'No anniversary found with id ' + id }, 404)
            }
            return c.json(anniversary, 200)
        } catch (error) {
            console.error(error)
            return c.json({ error: 'Failed to get anniversaries', details: error }, 500)
        }
    },

    // 記念日を更新
    async update(c: Context) {
        const parsed = updateAnniversarySchema.safeParse(await c.req.json())
        if (!parsed.success) {
            const errors = parsed.error.errors.map((err) => ({
                message: err.message,
                path: err.path,
            }))
            return c.json({ error: 'Validation failed', details: errors }, 400)
        }

        const userId = c.get('userId')
        if (!userId) {
            return c.json({ error: 'User id is required' }, 400)
        }
        const id = parseInt(c.req.param('id'), 10)

        try {
            const { name, date, categoryId } = parsed.data
            const anniversary = await prisma.anniversary.update({
                where: { id, userId: parseInt(userId, 10) },
                data: { name, date: new Date(date), categoryId },
            })
            return c.json(anniversary)
        } catch (error) {
            console.error(error)
            return c.json({ error: 'Failed to update anniversaries', details: error }, 500)
        }
    },

    // 記念日を削除
    async delete(c: Context) {
        const userId = c.get('userId')
        if (!userId) {
            return c.json({ error: 'User id is required' }, 400)
        }
        const id = parseInt(c.req.param('id'), 10)

        try {
            await prisma.anniversary.delete({
                where: { id, userId: parseInt(userId, 10) },
            })
            return c.newResponse(null, { status: 204 })
        } catch (error) {
            console.error(error)
            return c.json({ error: 'Failed to delete anniversary' }, 500)
        }
    },
}

export default anniversaryController
