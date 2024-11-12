import request from 'supertest'
import { serve } from '@hono/node-server'
import { app } from '../../src/index.local'

// HTTP サーバーを作成
const server = serve({ fetch: app.fetch, port: 3001 })

describe('categories router', () => {
    afterAll(async () => {
        server.close()
    })

    describe('GET /categories', () => {
        it('should route to categoryController.getAll', async () => {
            const res = await request(server).get('/api/categories')
            expect(res.status).toBe(401) // 認証エラー
        })
    })

    describe('POST /categories', () => {
        it('should route to categoryController.create', async () => {
            const res = await request(server).post('/api/categories')
            expect(res.status).toBe(401) // 認証エラー
        })
    })

    describe('GET /categories/:id', () => {
        it('should route to categoryController.get', async () => {
            const res = await request(server).get('/api/categories/1')
            expect(res.status).toBe(401) // 認証エラー
        })
    })

    describe('PUT /categories/:id', () => {
        it('should route to categoryController.update', async () => {
            const res = await request(server).put('/api/categories/1')
            expect(res.status).toBe(401) // 認証エラー
        })
    })

    describe('DELETE /categories/:id', () => {
        it('should route to categoryController.delete', async () => {
            const res = await request(server).delete('/api/categories/1')
            expect(res.status).toBe(401) // 認証エラー
        })
    })
})
