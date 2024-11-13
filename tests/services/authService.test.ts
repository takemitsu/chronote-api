import { PrismaClient } from '@prisma/client'
import prisma from '../../src/utils/prisma'
import { faker } from '@faker-js/faker/locale/ja'
import authService from '../../src/services/authService'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'

const db = prisma as PrismaClient
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

describe('authService', () => {
    beforeEach(async () => {
        await db.anniversary.deleteMany({})
        await db.category.deleteMany({})
        await db.user.deleteMany({})
    })

    afterAll(async () => {
        await db.$disconnect()
    })

    describe('signup', () => {
        it('should create a new user', async () => {
            const name = faker.person.fullName()
            const email = faker.internet.email()
            const password = faker.internet.password()

            const user = await authService.signup(name, email, password)

            expect(user).toHaveProperty('id')
            expect(user.name).toBe(name)
            expect(user.email).toBe(email)
            expect(user.password).not.toBe(password) // ハッシュ化されていることを確認
            expect(user.provider).toBe('local')
        })

        it('should throw error if email already exists', async () => {
            const name = faker.person.fullName()
            const email = faker.internet.email()
            const password = faker.internet.password()

            // 同じメールアドレスのユーザーを事前に作成
            await db.user.create({
                data: {
                    name,
                    email,
                    password: await bcrypt.hash(password, 10),
                    provider: 'local',
                },
            })

            // 同じメールアドレスでユーザーを作成しようとするとエラーになることを確認
            await expect(authService.signup(name, email, password)).rejects.toThrowError('Email already exists')
        })
    })

    describe('signin', () => {
        it('should sign in with valid credentials', async () => {
            const name = faker.person.fullName()
            const email = faker.internet.email()
            const password = faker.internet.password()

            // ユーザーを事前に作成
            const hashedPassword = await bcrypt.hash(password, 10)
            await db.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    provider: 'local',
                },
            })

            const { user, token } = await authService.signin(email, password)

            expect(user).toHaveProperty('id')
            expect(user.name).toBe(name)
            expect(user.email).toBe(email)
            expect(user.password).toBeDefined()
            expect(user.provider).toBe('local')

            // JWT が有効であることを確認
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
            expect(decoded.userId).toBe(user.id)
        })

        it('should throw error if email is not found', async () => {
            const email = faker.internet.email()
            const password = faker.internet.password()

            await expect(authService.signin(email, password)).rejects.toThrowError('Invalid email or password')
        })

        it('should throw error if password is not match', async () => {
            const name = faker.person.fullName()
            const email = faker.internet.email()
            const password = faker.internet.password()

            // ユーザーを事前に作成
            const hashedPassword = await bcrypt.hash(password, 10)
            await db.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    provider: 'local',
                },
            })

            await expect(authService.signin(email, 'wrong-password')).rejects.toThrowError('Invalid email or password')
        })
    })
})
