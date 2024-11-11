import request from 'supertest'
import { serve } from '@hono/node-server'
import { app } from '../../src/index.local'
import { PrismaClient } from '@prisma/client'
import prisma from '../../src/utils/prisma'
import { faker } from '@faker-js/faker/locale/ja'
import * as jwt from 'jsonwebtoken'

const db = prisma as PrismaClient

// JWT のシークレットキー
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// HTTP サーバーを作成
const server = serve({ fetch: app.fetch, port: 3001 })

describe('userController', () => {
    beforeEach(async () => {
        await db.anniversary.deleteMany({})
        await db.category.deleteMany({})
        await db.user.deleteMany({})
    })

    afterAll(async () => {
        await db.$disconnect()
        server.close()
    })

    describe('GET /users/me', () => {
        it('should return user data', async () => {
            // ユーザーを事前に作成
            const user = await db.user.create({
                data: {
                    name: faker.person.fullName(),
                    email: faker.internet.email(),
                    password: 'password123',
                    provider: 'local',
                },
            })

            // JWT を生成
            const token = jwt.sign({ userId: user.id }, JWT_SECRET)

            const res = await request(server).get('/api/users/me').set('Authorization', `Bearer ${token}`) // Authorization ヘッダーにトークンをセット
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('id')
            expect(res.body.name).toBeDefined()
            expect(res.body.email).toBeDefined()
        })

        it('should return 401 error if Authorization header is missing', async () => {
            const res = await request(server).get('/api/users/me') // Authorization ヘッダーを指定しない
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Authorization header is required')
        })

        it('should return 401 error if token is invalid', async () => {
            const res = await request(server).get('/api/users/me').set('Authorization', 'Bearer invalid-token') // 無効なトークンを指定
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Invalid token')
        })
    })
})
