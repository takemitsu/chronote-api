import request from 'supertest'
import { serve } from '@hono/node-server'
import { app } from '../../src/index.local'
import { faker } from '@faker-js/faker/locale/ja'

// HTTP サーバーを作成
const server = serve({ fetch: app.fetch, port: 3001 })

describe('auth router', () => {
    afterAll(async () => {
        server.close()
    })

    describe('POST /auth/signup', () => {
        it('should route to authController.signup', async () => {
            const res = await request(server).post('/api/auth/signup').send({
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: 'password123',
            })
            expect(res.status).toBe(201)
        })
    })

    describe('POST /auth/signin', () => {
        it('should route to authController.signin', async () => {
            const res = await request(server).post('/api/auth/signin').send({
                email: faker.internet.email(),
                password: 'password123',
            })
            expect(res.status).toBe(401) // 認証エラー
        })
    })

    describe('POST /auth/signout', () => {
        it('should route to authController.signout', async () => {
            const res = await request(server).post('/api/auth/signout')
            expect(res.status).toBe(200)
        })
    })
})
