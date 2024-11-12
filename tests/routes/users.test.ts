import request from 'supertest'
import { serve } from '@hono/node-server'
import { app } from '../../src/index.local'

// HTTP サーバーを作成
const server = serve({ fetch: app.fetch, port: 3001 })

describe('users router', () => {
    afterAll(async () => {
        server.close()
    })

    describe('GET /users/me', () => {
        it('should route to userController.me', async () => {
            const res = await request(server).get('/api/users/me')
            expect(res.status).toBe(401) // 認証エラー
        })
    })
})
