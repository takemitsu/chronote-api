import request from 'supertest'
import { serve } from '@hono/node-server'
import { app } from '../../src/index.local'
import { PrismaClient } from '@prisma/client'
import prisma from '../../src/utils/prisma'
import { faker } from '@faker-js/faker/locale/ja'
import * as jwt from 'jsonwebtoken'

const db = prisma as PrismaClient
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// HTTP サーバーを作成
const server = serve({ fetch: app.fetch, port: 3001 })

describe('categoryController', () => {
    let user: any
    let token: string

    beforeEach(async () => {
        await db.anniversary.deleteMany({})
        await db.category.deleteMany({})
        await db.user.deleteMany({})

        // テストユーザーを作成
        user = await db.user.create({
            data: {
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: 'password123',
                provider: 'local',
            },
        })

        // JWT を生成
        token = jwt.sign({ userId: user.id }, JWT_SECRET)
    })

    afterAll(async () => {
        await db.$disconnect()
        server.close()
    })

    describe('GET /categories', () => {
        it('should return categories', async () => {
            // カテゴリを事前に作成
            await db.category.createMany({
                data: [
                    { name: 'Category 1', userId: user.id },
                    { name: 'Category 2', userId: user.id },
                ],
            })

            const res = await request(server).get('/api/categories').set('Authorization', `Bearer ${token}`)
            expect(res.status).toBe(200)
            expect(res.body).toHaveLength(2)
            expect(res.body[0]).toHaveProperty('id')
            expect(res.body[0].name).toBe('Category 1')
            expect(res.body[1]).toHaveProperty('id')
            expect(res.body[1].name).toBe('Category 2')
        })

        it('should return 200 No Content if no categories', async () => {
            const res = await request(server).get('/api/categories').set('Authorization', `Bearer ${token}`)
            expect(res.status).toBe(200)
        })

        it('should return 401 error if Authorization header is missing', async () => {
            const res = await request(server).get('/api/categories')
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Authorization header is required')
        })

        it('should return 401 error if token is invalid', async () => {
            const res = await request(server).get('/api/categories').set('Authorization', 'Bearer invalid-token')
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Invalid token')
        })
    })

    describe('POST /categories', () => {
        it('should create a new category', async () => {
            const res = await request(server)
                .post('/api/categories')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'New Category' })
            expect(res.status).toBe(201)
            expect(res.body).toHaveProperty('id')
            expect(res.body.name).toBe('New Category')
            expect(res.body.userId).toBe(user.id)
        })

        it('should return 400 error if name is missing', async () => {
            const res = await request(server).post('/api/categories').set('Authorization', `Bearer ${token}`).send({})
            expect(res.status).toBe(400)
            expect(res.body.error).toBe('Validation failed')
        })

        it('should return 401 error if Authorization header is missing', async () => {
            const res = await request(server).post('/api/categories').send({ name: 'New Category' })
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Authorization header is required')
        })

        it('should return 401 error if token is invalid', async () => {
            const res = await request(server)
                .post('/api/categories')
                .set('Authorization', 'Bearer invalid-token')
                .send({ name: 'New Category' })
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Invalid token')
        })
    })

    describe('GET /categories/:id', () => {
        it('should return a category', async () => {
            // カテゴリを事前に作成
            const category = await db.category.create({
                data: { name: 'Category 1', userId: user.id },
            })

            const res = await request(server).get(`/api/categories/${category.id}`).set('Authorization', `Bearer ${token}`)
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('id')
            expect(res.body.name).toBe('Category 1')
            expect(res.body.userId).toBe(user.id)
        })

        it('should return 404 error if category is not found', async () => {
            const res = await request(server).get('/api/categories/999').set('Authorization', `Bearer ${token}`)
            expect(res.status).toBe(404)
            expect(res.body.error).toBe('Category not found')
        })

        it('should return 401 error if Authorization header is missing', async () => {
            const res = await request(server).get('/api/categories/1')
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Authorization header is required')
        })

        it('should return 401 error if token is invalid', async () => {
            const res = await request(server).get('/api/categories/1').set('Authorization', 'Bearer invalid-token')
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Invalid token')
        })
    })

    describe('PUT /categories/:id', () => {
        it('should update a category', async () => {
            // カテゴリを事前に作成
            const category = await db.category.create({
                data: { name: 'Category 1', userId: user.id },
            })

            const res = await request(server)
                .put(`/api/categories/${category.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated Category' })
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('id')
            expect(res.body.name).toBe('Updated Category')
            expect(res.body.userId).toBe(user.id)
        })

        it('should return 400 error if name is missing', async () => {
            // カテゴリを事前に作成
            const category = await db.category.create({
                data: { name: 'Category 1', userId: user.id },
            })

            const res = await request(server)
                .put(`/api/categories/${category.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({})
            expect(res.status).toBe(400)
            expect(res.body.error).toBe('Validation failed')
        })

        it('should return 404 error if category is not found', async () => {
            const res = await request(server)
                .put('/api/categories/999')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated Category' })
            expect(res.status).toBe(404)
            expect(res.body.error).toBe('Category not found')
        })

        it('should return 401 error if Authorization header is missing', async () => {
            const res = await request(server).put('/api/categories/1').send({ name: 'Updated Category' })
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Authorization header is required')
        })

        it('should return 401 error if token is invalid', async () => {
            const res = await request(server)
                .put('/api/categories/1')
                .set('Authorization', 'Bearer invalid-token')
                .send({ name: 'Updated Category' })
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Invalid token')
        })
    })

    describe('DELETE /categories/:id', () => {
        it('should delete a category', async () => {
            // カテゴリを事前に作成
            const category = await db.category.create({
                data: { name: 'Category 1', userId: user.id },
            })

            const res = await request(server).delete(`/api/categories/${category.id}`).set('Authorization', `Bearer ${token}`)
            expect(res.status).toBe(204)
        })

        it('should return 404 error if category is not found', async () => {
            const res = await request(server).delete('/api/categories/999').set('Authorization', `Bearer ${token}`)
            expect(res.status).toBe(404)
            expect(res.body.error).toBe('Category not found')
        })

        it('should return 401 error if Authorization header is missing', async () => {
            const res = await request(server).delete('/api/categories/1')
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Authorization header is required')
        })

        it('should return 401 error if token is invalid', async () => {
            const res = await request(server).delete('/api/categories/1').set('Authorization', 'Bearer invalid-token')
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Invalid token')
        })
    })
})
