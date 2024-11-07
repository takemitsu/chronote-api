import { PrismaClient } from '@prisma/client'
import { Context } from 'hono'

const prisma = new PrismaClient()

const userController = {
    async me(c: Context) {
        const userId = c.get('userId')
        if (!userId) {
            return c.json({ error: 'User id is required' }, 400)
        }

        try {
            const user = await prisma.user.findUnique({
                where: { id: parseInt(userId, 10) },
                select: {
                    id: true,
                    name: true,
                    email: true,
                }, // 必要最低限の情報のみ返す
            })

            if (!user) {
                return c.json({ error: 'User not found' }, 404)
            }

            return c.json(user)
        } catch (error) {
            console.error(error)
            return c.json({ error: 'Failed to fetch user data' }, 500)
        }
    },
}

export default userController
