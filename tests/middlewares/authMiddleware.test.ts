import { Context, Next } from 'hono'
import { authMiddleware } from '../../src/middlewares/authMiddleware'
import * as jwt from 'jsonwebtoken'

// JWT のシークレットキー
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

describe('authMiddleware', () => {
    it('should set userId to context if token is valid', async () => {
        // モックの Context と Next を作成
        const c = {
            req: {
                header: (name: string) => {
                    if (name === 'Authorization') {
                        // 有効な JWT を返す
                        const token = jwt.sign({ userId: 1 }, JWT_SECRET)
                        return `Bearer ${token}`
                    }
                    return undefined
                },
            },
            set: jest.fn(), // c.set をモック
        } as unknown as Context
        const next = jest.fn() as Next

        // authMiddleware を実行
        await authMiddleware()(c, next)

        // userId が Context に保存されていることを確認
        expect(c.set).toHaveBeenCalledWith('userId', '1')

        // next が呼び出されていることを確認
        expect(next).toHaveBeenCalled()
    })

    it('should return 401 error if Authorization header is missing', async () => {
        // モックの Context と Next を作成
        const c = {
            req: {
                header: (name: string) => undefined,
            },
            json: jest.fn(() => ({ error: 'Authorization header is required' })), // c.json をモック
        } as unknown as Context
        const next = jest.fn() as Next

        // authMiddleware を実行
        await authMiddleware()(c, next)

        // c.json が期待通りの引数で呼び出されていることを確認
        expect(c.json).toHaveBeenCalledWith({ error: 'Authorization header is required' }, 401)

        // next が呼び出されていないことを確認
        expect(next).not.toHaveBeenCalled()
    })

    it('should return 401 error if token is invalid', async () => {
        // モックの Context と Next を作成
        const c = {
            req: {
                header: (name: string) => {
                    if (name === 'Authorization') {
                        // 無効な JWT を返す
                        return 'Bearer invalid-token'
                    }
                    return undefined
                },
            },
            json: jest.fn(() => ({ error: 'Invalid token' })), // c.json をモック
        } as unknown as Context
        const next = jest.fn() as Next

        // authMiddleware を実行
        await authMiddleware()(c, next)

        // c.json が期待通りの引数で呼び出されていることを確認
        expect(c.json).toHaveBeenCalledWith({ error: 'Invalid token' }, 401)

        // next が呼び出されていないことを確認
        expect(next).not.toHaveBeenCalled()
    })
})
