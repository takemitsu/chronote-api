import request from 'supertest'
import { serve } from '@hono/node-server'
import { app } from '../../src/index.local'

// HTTP サーバーを作成
const server = serve({ fetch: app.fetch, port: 3001 })

describe('anniversaries router', () => {
    afterAll(async () => {
        server.close()
    })

    describe('GET /anniversaries', () => {
        it('should route to anniversaryController.getAll', async () => {
            const res = await request(server).get('/api/anniversaries')
            expect(res.status).toBe(401) // 認証エラー
        })
    })

    describe('POST /anniversaries', () => {
        it('should route to anniversaryController.create', async () => {
            const res = await request(server).post('/api/anniversaries')
            expect(res.status).toBe(401) // 認証エラー
        })
    })

    describe('GET /anniversaries/:id', () => {
        it('should route to anniversaryController.get', async () => {
            const res = await request(server).get('/api/anniversaries/1')
            expect(res.status).toBe(401) // 認証エラー
        })
    })

    describe('PUT /anniversaries/:id', () => {
        it('should route to anniversaryController.update', async () => {
            const res = await request(server).put('/api/anniversaries/1')
            expect(res.status).toBe(401) // 認証エラー
        })
    })

    describe('DELETE /anniversaries/:id', () => {
        it('should route to anniversaryController.delete', async () => {
            const res = await request(server).delete('/api/anniversaries/1')
            expect(res.status).toBe(401) // 認証エラー
        })
    })
})
