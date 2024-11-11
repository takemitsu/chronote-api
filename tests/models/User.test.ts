import prisma from '../../src/utils/prisma'
import { Prisma, PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker/locale/ja'

const db = prisma as PrismaClient

describe('User model', () => {
    // 各テストケースの前にデータベースをクリア
    beforeEach(async () => {
        await db.anniversary.deleteMany({})
        await db.category.deleteMany({})
        await db.user.deleteMany({})
    })
    // すべてのテストケースの後でデータベース接続を切断
    afterAll(async () => {
        await db.$disconnect()
    })

    it('should create a new user', async () => {
        const user = await db.user.create({
            data: {
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: 'password123',
                provider: 'local',
            },
        })
        expect(user).toHaveProperty('id')
        expect(user.name).toBeDefined()
        expect(user.email).toBeDefined()
        expect(user.password).toBeDefined()
        expect(user.provider).toBe('local')
    })

    it('should fail to create a new user with a duplicate email', async () => {
        await db.user.create({
            data: {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                provider: 'local',
            },
        })

        await expect(
            db.user.create({
                data: {
                    name: 'Test User 2',
                    email: 'test@example.com', // 重複したメールアドレス
                    password: 'password456',
                    provider: 'local',
                },
            }),
        ).rejects.toThrowError('Unique constraint failed on the constraint: `User_email_key`')
    })

    it('should fail to create a new user without a name', async () => {
        // name を指定せずにユーザーを作成しようとするとエラーになることを確認
        const userData: Omit<Prisma.UserCreateInput, 'name'> = {
            email: faker.internet.email(),
            password: 'password123',
            provider: 'local',
        }
        await expect(db.user.create({ data: userData as any })).rejects.toThrowError(/name/)
    })
})
