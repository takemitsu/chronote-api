import request from 'supertest'
import { serve } from '@hono/node-server'
import { app } from '../../src/index.local'
import { PrismaClient } from '@prisma/client'
import prisma from '../../src/utils/prisma'
import * as bcrypt from 'bcrypt'

const db = prisma as PrismaClient

// HTTP サーバーを作成
const server = serve({ fetch: app.fetch, port: 3001 })

describe('authController', () => {
    beforeEach(async () => {
        await db.anniversary.deleteMany({})
        await db.category.deleteMany({})
        await db.user.deleteMany({})
    })

    afterAll(async () => {
        await db.$disconnect()
        server.close()
    })

    describe('POST /auth/signup', () => {
        it('should create a new user', async () => {
            const res = await request(server).post('/api/auth/signup').send({
                name: 'Test User',
                email: 'test@example.net',
                password: 'password123',
            })
            expect(res.status).toBe(201)
            expect(res.body).toHaveProperty('id')
            expect(res.body.name).toBe('Test User')
            expect(res.body.email).toBe('test@example.net')
            expect(res.body.password).not.toBe('password123') // ハッシュ化されていることを確認
            expect(res.body.provider).toBe('local')
        })

        it('should fail to create a new user with a duplicate email', async () => {
            // 同じメールアドレスのユーザーを事前に作成
            await db.user.create({
                data: {
                    name: 'Test User',
                    email: 'test@example.net',
                    password: await bcrypt.hash('password123', 10),
                    provider: 'local',
                },
            })

            const res = await request(server).post('/api/auth/signup').send({
                name: 'Test User',
                email: 'test@example.net', // 重複したメールアドレス
                password: 'password123',
            })
            expect(res.status).toBe(400)
            expect(res.body.error).toBe('Email already exists')
        })

        it('should fail to create a new user without a name', async () => {
            const res = await request(server).post('/api/auth/signup').send({
                email: 'test@example.net',
                password: 'password123',
            })
            expect(res.status).toBe(400)
            expect(res.body.error[0].message).toBe('Required')
        })

        it('should fail to create a new user with an invalid email', async () => {
            const res = await request(server).post('/api/auth/signup').send({
                name: 'Test User',
                email: 'invalid-email',
                password: 'password123',
            })
            expect(res.status).toBe(400)
            expect(res.body.error[0].message).toBe('Invalid email format')
        })

        it('should fail to create a new user with a short password', async () => {
            const res = await request(server).post('/api/auth/signup').send({
                name: 'Test User',
                email: 'test@example.net',
                password: 'short',
            })
            expect(res.status).toBe(400)
            expect(res.body.error[0].message).toBe('Password must be at least 8 characters')
        })
    })

    describe('POST /auth/signin', () => {
        it('should sign in with valid credentials', async () => {
            // ユーザーを事前に作成
            const password = 'password123'
            const hashedPassword = await bcrypt.hash(password, 10)
            const user = await db.user.create({
                data: {
                    name: 'Test User',
                    email: 'test@example.net',
                    password: hashedPassword,
                    provider: 'local',
                },
            })

            const res = await request(server).post('/api/auth/signin').send({
                email: 'test@example.net',
                password: password,
            })
            expect(res.status).toBe(200)
            expect(res.body.user).toHaveProperty('id')
            expect(res.body.user.name).toBe('Test User')
            expect(res.body.user.email).toBe('test@example.net')
            expect(res.body.user.password).toBeDefined()
            expect(res.body.user.provider).toBe('local')
        })

        it('should fail to sign in with invalid email', async () => {
            const res = await request(server).post('/api/auth/signin').send({
                email: 'invalid-email',
                password: 'password123',
            })
            expect(res.status).toBe(400)
            const jsonObject = JSON.parse(res.body.error)
            expect(jsonObject[0].message).toBe('Invalid email format')
        })

        it('should fail to sign in with invalid password', async () => {
            // ユーザーを事前に作成
            const password = 'password123'
            const hashedPassword = await bcrypt.hash(password, 10)
            await db.user.create({
                data: {
                    name: 'Test User',
                    email: 'test@example.net',
                    password: hashedPassword,
                    provider: 'local',
                },
            })

            const res = await request(server).post('/api/auth/signin').send({
                email: 'test@example.net',
                password: 'wrong-password',
            })
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Invalid email or password')
        })

        it('should fail to sign in with non-existent email', async () => {
            const res = await request(server).post('/api/auth/signin').send({
                email: 'nonexistent@example.com',
                password: 'password123',
            })
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Invalid email or password')
        })
    })

    describe('POST /auth/signout', () => {
        it('should sign out', async () => {
            const res = await request(server).post('/api/auth/signout')
            expect(res.status).toBe(200)
            expect(res.body.message).toBe('Signed out')
        })
    })
})
