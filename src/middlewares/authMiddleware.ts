import { Context, Next } from 'hono'
import * as jwt from 'jsonwebtoken'

// JWT のシークレットキー
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is required in .env file')
}

export const authMiddleware = () => {
    return async (c: Context, next: Next) => {
        const authHeader = c.req.header('Authorization')
        if (!authHeader) {
            return c.json({ error: 'Authorization header is required' }, 401)
        }

        // Bearer <token> の形式からトークン部分を抽出
        const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.split(' ')[1] : null
        if (!token) {
            return c.json({ error: 'Token is missing or malformed' }, 401)
        }

        try {
            // JWT を検証
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
            if (typeof decoded.userId !== 'number') {
                // userId の型チェック
                return c.json({ error: 'Invalid token payload' }, 401)
            }

            // userId を Context に保存
            c.set('userId', decoded.userId.toString())
            // 次のミドルウェアまたはコントローラーに処理を移譲
            await next()
        } catch (error) {
            console.debug('JWT verification error:', error)
            return c.json({ error: 'Invalid token' }, 401)
        }
    }
}
