import { Context, Next } from 'hono'

export const userIdMiddleware = () => {
    return async (c: Context, next: Next) => {
        const userId = c.req.header('x-user-id')
        if (!userId) {
            return c.json({ error: 'User id is not found' }, 400)
        }
        c.set('userId', userId)
        await next()
    }
}
