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

describe('anniversaryController', () => {
    let user: any
    let token: string
    let category: any

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

        // テストカテゴリを作成
        category = await db.category.create({
            data: {
                name: faker.lorem.word(),
                userId: user.id,
            },
        })

        // JWT を生成
        token = jwt.sign({ userId: user.id }, JWT_SECRET)
    })

    afterAll(async () => {
        await db.$disconnect()
        server.close()
    })

    describe('GET /anniversaries', () => {
        it('should return anniversaries', async () => {
            // 記念日を事前に作成
            await db.anniversary.createMany({
                data: [
                    {
                        name: 'Anniversary 1',
                        date: new Date(),
                        userId: user.id,
                        categoryId: category.id,
                    },
                    {
                        name: 'Anniversary 2',
                        date: new Date(),
                        userId: user.id,
                        categoryId: category.id,
                    },
                ],
            })

            const res = await request(server).get('/api/anniversaries').set('Authorization', `Bearer ${token}`)
            expect(res.status).toBe(200)
            expect(res.body).toHaveLength(2)
            expect(res.body[0]).toHaveProperty('id')
            expect(res.body[0].name).toBe('Anniversary 1')
            expect(res.body[1]).toHaveProperty('id')
            expect(res.body[1].name).toBe('Anniversary 2')
        })

        it('should return 204 No Content if no anniversaries', async () => {
            const res = await request(server).get('/api/anniversaries').set('Authorization', `Bearer ${token}`)
            expect(res.status).toBe(200)
        })

        it('should return 401 error if Authorization header is missing', async () => {
            const res = await request(server).get('/api/anniversaries')
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Authorization header is required')
        })

        it('should return 401 error if token is invalid', async () => {
            const res = await request(server).get('/api/anniversaries').set('Authorization', 'Bearer invalid-token')
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Invalid token')
        })
    })

    describe('POST /anniversaries', () => {
        it('should create a new anniversary', async () => {
            const res = await request(server).post('/api/anniversaries').set('Authorization', `Bearer ${token}`).send({
                name: 'New Anniversary',
                date: new Date(),
                categoryId: category.id,
            })
            expect(res.status).toBe(201)
            expect(res.body).toHaveProperty('id')
            expect(res.body.name).toBe('New Anniversary')
            expect(res.body.userId).toBe(user.id)
            expect(res.body.categoryId).toBe(category.id)
        })

        it('should return 400 error if name is missing', async () => {
            const res = await request(server).post('/api/anniversaries').set('Authorization', `Bearer ${token}`).send({
                date: new Date(),
                categoryId: category.id,
            })
            expect(res.status).toBe(400)
            expect(res.body.error).toBe('Validation failed')
        })

        it('should return 400 error if date is missing', async () => {
            const res = await request(server).post('/api/anniversaries').set('Authorization', `Bearer ${token}`).send({
                name: 'New Anniversary',
                categoryId: category.id,
            })
            expect(res.status).toBe(400)
            expect(res.body.error).toBe('Validation failed')
        })

        it('should return 400 error if categoryId is missing', async () => {
            const res = await request(server).post('/api/anniversaries').set('Authorization', `Bearer ${token}`).send({
                name: 'New Anniversary',
                date: new Date(),
            })
            expect(res.status).toBe(400)
            expect(res.body.error).toBe('Validation failed')
        })

        it('should return 401 error if Authorization header is missing', async () => {
            const res = await request(server).post('/api/anniversaries').send({
                name: 'New Anniversary',
                date: new Date(),
                categoryId: category.id,
            })
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Authorization header is required')
        })

        it('should return 401 error if token is invalid', async () => {
            const res = await request(server).post('/api/anniversaries').set('Authorization', 'Bearer invalid-token').send({
                name: 'New Anniversary',
                date: new Date(),
                categoryId: category.id,
            })
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Invalid token')
        })
    })

    describe('GET /anniversaries/:id', () => {
        it('should return an anniversary', async () => {
            // 記念日を事前に作成
            const anniversary = await db.anniversary.create({
                data: {
                    name: 'Anniversary 1',
                    date: new Date(),
                    userId: user.id,
                    categoryId: category.id,
                },
            })

            const res = await request(server).get(`/api/anniversaries/${anniversary.id}`).set('Authorization', `Bearer ${token}`)
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('id')
            expect(res.body.name).toBe('Anniversary 1')
            expect(res.body.userId).toBe(user.id)
            expect(res.body.categoryId).toBe(category.id)
        })

        it('should return 404 error if anniversary is not found', async () => {
            const res = await request(server).get('/api/anniversaries/999').set('Authorization', `Bearer ${token}`)
            expect(res.status).toBe(404)
            expect(res.body.error).toBe('No anniversary found with id 999')
        })

        it('should return 401 error if Authorization header is missing', async () => {
            const res = await request(server).get('/api/anniversaries/1')
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Authorization header is required')
        })

        it('should return 401 error if token is invalid', async () => {
            const res = await request(server).get('/api/anniversaries/1').set('Authorization', 'Bearer invalid-token')
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Invalid token')
        })
    })

    describe('PUT /anniversaries/:id', () => {
        it('should update an anniversary', async () => {
            // 記念日を事前に作成
            const anniversary = await db.anniversary.create({
                data: {
                    name: 'Anniversary 1',
                    date: new Date(),
                    userId: user.id,
                    categoryId: category.id,
                },
            })

            const res = await request(server)
                .put(`/api/anniversaries/${anniversary.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Updated Anniversary',
                    date: new Date(),
                    categoryId: category.id,
                })
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('id')
            expect(res.body.name).toBe('Updated Anniversary')
            expect(res.body.userId).toBe(user.id)
            expect(res.body.categoryId).toBe(category.id)
        })

        it('should return 400 error if name is missing', async () => {
            // 記念日を事前に作成
            const anniversary = await db.anniversary.create({
                data: {
                    name: 'Anniversary 1',
                    date: new Date(),
                    userId: user.id,
                    categoryId: category.id,
                },
            })

            const res = await request(server)
                .put(`/api/anniversaries/${anniversary.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    date: new Date(),
                    categoryId: category.id,
                })
            expect(res.status).toBe(400)
            expect(res.body.error).toBe('Validation failed')
        })

        it('should return 400 error if date is missing', async () => {
            // 記念日を事前に作成
            const anniversary = await db.anniversary.create({
                data: {
                    name: 'Anniversary 1',
                    date: new Date(),
                    userId: user.id,
                    categoryId: category.id,
                },
            })

            const res = await request(server)
                .put(`/api/anniversaries/${anniversary.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Updated Anniversary',
                    categoryId: category.id,
                })
            expect(res.status).toBe(400)
            expect(res.body.error).toBe('Validation failed')
        })

        it('should return 400 error if categoryId is missing', async () => {
            // 記念日を事前に作成
            const anniversary = await db.anniversary.create({
                data: {
                    name: 'Anniversary 1',
                    date: new Date(),
                    userId: user.id,
                    categoryId: category.id,
                },
            })

            const res = await request(server)
                .put(`/api/anniversaries/${anniversary.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Updated Anniversary',
                    date: new Date(),
                })
            expect(res.status).toBe(400)
            expect(res.body.error).toBe('Validation failed')
        })

        it('should return 404 error if anniversary is not found', async () => {
            const res = await request(server).put('/api/anniversaries/999').set('Authorization', `Bearer ${token}`).send({
                name: 'Updated Anniversary',
                date: new Date(),
                categoryId: category.id,
            })
            expect(res.status).toBe(404)
            expect(res.body.error).toBe('Anniversary not found')
        })

        it('should return 401 error if Authorization header is missing', async () => {
            const res = await request(server).put('/api/anniversaries/1').send({
                name: 'Updated Anniversary',
                date: new Date(),
                categoryId: category.id,
            })
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Authorization header is required')
        })

        it('should return 401 error if token is invalid', async () => {
            const res = await request(server).put('/api/anniversaries/1').set('Authorization', 'Bearer invalid-token').send({
                name: 'Updated Anniversary',
                date: new Date(),
                categoryId: category.id,
            })
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Invalid token')
        })
    })

    describe('DELETE /anniversaries/:id', () => {
        it('should delete an anniversary', async () => {
            // 記念日を事前に作成
            const anniversary = await db.anniversary.create({
                data: {
                    name: 'Anniversary 1',
                    date: new Date(),
                    userId: user.id,
                    categoryId: category.id,
                },
            })

            const res = await request(server)
                .delete(`/api/anniversaries/${anniversary.id}`)
                .set('Authorization', `Bearer ${token}`)
            expect(res.status).toBe(204)
        })

        it('should return 404 error if anniversary is not found', async () => {
            const res = await request(server).delete('/api/anniversaries/999').set('Authorization', `Bearer ${token}`)
            expect(res.status).toBe(404)
            expect(res.body.error).toBe('Anniversary not found')
        })

        it('should return 401 error if Authorization header is missing', async () => {
            const res = await request(server).delete('/api/anniversaries/1')
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Authorization header is required')
        })

        it('should return 401 error if token is invalid', async () => {
            const res = await request(server).delete('/api/anniversaries/1').set('Authorization', 'Bearer invalid-token')
            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Invalid token')
        })
    })
})
