import { Prisma, PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { Context } from 'hono'

const prisma = new PrismaClient()

// カテゴリ作成時のリクエストボディのスキーマ
const createCategorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
})
// カテゴリ更新時のリクエストボディのスキーマ
const updateCategorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
})

const categoryController = {
    /**
     * ユーザIDに紐づくカテゴリを取得
     * @param c
     */
    async getAll(c: Context) {
        const userId = c.get('userId')
        if (!userId) {
            return c.json({ error: 'User id is required' }, 400)
        }

        try {
            const categories = await prisma.category.findMany({
                where: { userId: parseInt(userId, 10) },
            })
            return c.json(categories || [], 200)
        } catch (error) {
            console.error(error)
            return c.json({ error: 'Failed to fetch categories' }, 500)
        }
    },

    /**
     * ユーザIDに紐づくカテゴリを作成
     * @param c
     */
    async create(c: Context) {
        const parsed = createCategorySchema.safeParse(await c.req.json())
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
            const { name } = parsed.data
            const category = await prisma.category.create({
                data: { name, userId: parseInt(userId, 10) },
            })
            return c.json(category, 201)
        } catch (error) {
            console.error(error)
            return c.json({ error: 'Failed to create category' }, 500)
        }
    },

    /**
     * ユーザID、カテゴリIDのデータを取得
     * @param c
     */
    async get(c: Context) {
        const userId = c.get('userId')
        if (!userId) {
            return c.json({ error: 'User id is required' }, 400)
        }
        const id = parseInt(c.req.param('id'), 10)
        try {
            const category = await prisma.category.findFirst({ where: { id, userId: parseInt(userId, 10) } })
            if (!category) {
                return c.json({ error: 'Category not found' }, 404)
            }
            return c.json(category, 200)
        } catch (error) {
            console.error(error)
            return c.json({ error: 'Failed to fetch category' }, 500)
        }
    },

    /**
     * 指定のカテゴリの編集
     * @param c
     */
    async update(c: Context) {
        const parsed = updateCategorySchema.safeParse(await c.req.json())
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
            const { name } = parsed.data
            const category = await prisma.category.update({
                where: { id, userId: parseInt(userId, 10) },
                data: { name },
            })
            return c.json(category, 200)
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                // 更新対象のカテゴリが見つからない場合
                return c.json({ error: 'Category not found' }, 404) // 404 エラーを返す
            }
            console.error(error)
            return c.json({ error: 'Failed to update category' }, 500)
        }
    },

    /**
     * 指定のカテゴリを削除
     * @param c
     */
    async delete(c: Context) {
        const userId = c.get('userId')
        if (!userId) {
            return c.json({ error: 'User id is required' }, 400)
        }
        const id = parseInt(c.req.param('id'), 10)

        try {
            await prisma.category.delete({ where: { id, userId: parseInt(userId, 10) } })
            return c.json({ message: `Category ${id} deleted` }, 204)
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                // 更新対象のカテゴリが見つからない場合
                return c.json({ error: 'Category not found' }, 404) // 404 エラーを返す
            }
            console.error(error)
            return c.json({ error: 'Failed to delete category' }, 500)
        }
    },
}

export default categoryController
