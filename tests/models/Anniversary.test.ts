import prisma from '../../src/utils/prisma'
import { Prisma, PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker/locale/ja'

const db = prisma as PrismaClient

describe('Anniversary model', () => {
    // 各テストケースの前にデータベースをクリア
    beforeEach(async () => {
        await db.anniversary.deleteMany({})
        await db.category.deleteMany({})
        await db.user.deleteMany({})
    })

    // 全てのテストケースの後でデータベース接続を切断
    afterAll(async () => {
        await db.$disconnect()
    })

    it('should create a new anniversary', async () => {
        const user = await db.user.create({
            data: {
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: 'password123',
                provider: 'local',
            },
        })

        const category = await db.category.create({
            data: {
                name: faker.lorem.word(),
                userId: user.id,
            },
        })

        const anniversary = await db.anniversary.create({
            data: {
                name: faker.lorem.words(),
                date: faker.date.future(),
                userId: user.id,
                categoryId: category.id,
            },
        })

        expect(anniversary).toHaveProperty('id')
        expect(anniversary.name).toBeDefined()
        expect(anniversary.date).toBeDefined()
        expect(anniversary.userId).toBe(user.id)
        expect(anniversary.categoryId).toBe(category.id)
    })

    // userId が無効な場合
    it('should fail to create a new anniversary with an invalid userId', async () => {
        const user = await db.user.create({
            data: {
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: 'password123',
                provider: 'local',
            },
        })

        const category = await db.category.create({
            data: {
                name: faker.lorem.word(),
                userId: user.id,
            },
        })

        await expect(async () => {
            await db.anniversary.create({
                data: {
                    name: faker.lorem.words(),
                    date: faker.date.future(),
                    userId: Number.MAX_SAFE_INTEGER, // 確実に無効な userId
                    categoryId: category.id,
                },
            })
        }).rejects.toThrowError()
    })

    // categoryId が無効な場合
    it('should fail to create a new anniversary with an invalid categoryId', async () => {
        const user = await db.user.create({
            data: {
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: 'password123',
                provider: 'local',
            },
        })

        await db.category.create({
            data: {
                name: faker.lorem.word(),
                userId: user.id,
            },
        })

        await expect(async () => {
            await db.anniversary.create({
                data: {
                    name: faker.lorem.words(),
                    date: faker.date.future(),
                    userId: user.id,
                    categoryId: Number.MAX_SAFE_INTEGER, // 確実に無効な categoryId
                },
            })
        }).rejects.toThrowError()
    })

    // name が ない場合
    it('should fail to create a new anniversary with a null name', async () => {
        const user = await db.user.create({
            data: {
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: 'password123',
                provider: 'local',
            },
        })

        const category = await db.category.create({
            data: {
                name: faker.lorem.word(),
                userId: user.id,
            },
        })

        // name を指定せずにデータを作成し、エラーが発生することを確認
        const anniversaryData: Omit<Prisma.AnniversaryCreateInput, 'name'> = {
            date: faker.date.future(),
            user: { connect: { id: user.id } },
            category: { connect: { id: category.id } },
        }

        await expect(db.anniversary.create({ data: anniversaryData as any })).rejects.toThrowError(/name/)
    })

    // date が null の場合
    it('should fail to create a new anniversary with a null date', async () => {
        const user = await db.user.create({
            data: {
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: 'password123',
                provider: 'local',
            },
        })

        const category = await db.category.create({
            data: {
                name: faker.lorem.word(),
                userId: user.id,
            },
        })

        // date を指定せずにデータを作成し、エラーが発生することを確認
        const anniversaryData: Omit<Prisma.AnniversaryCreateInput, 'date'> = {
            name: faker.lorem.words(),
            user: { connect: { id: user.id } },
            category: { connect: { id: category.id } },
        }

        await expect(db.anniversary.create({ data: anniversaryData as any })).rejects.toThrowError(/date/)
    })
})
