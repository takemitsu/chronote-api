import prisma from '../../src/utils/prisma'
import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker/locale/ja'

const db = prisma as PrismaClient

describe('Category model', () => {
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

    it('should create a new category', async () => {
        // User を作成
        const user = await db.user.create({
            data: {
                name: faker.person.fullName(), // faker-js を使用
                email: faker.internet.email(), // faker-js を使用
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
        expect(category).toHaveProperty('id')
        expect(category.name).toBeDefined()
        expect(category.userId).toBe(user.id)
    })

    // 型エラーが発生するため、不要
    // it('should fail to create a new category without a name', async () => {
    //     // User を作成
    //     const user = await db.user.create({
    //         data: {
    //             name: faker.person.fullName(),
    //             email: faker.internet.email(),
    //             password: 'password123',
    //             provider: 'local',
    //         },
    //     })
    //
    //     // name を指定せずにカテゴリを作成しようとするとエラーになることを確認
    //     await expect(
    //         db.category.create({
    //             data: {
    //                 userId: user.id,
    //                 name: null,
    //             },
    //         }),
    //     ).rejects.toThrowError()
    // })

    it('should fail to create a new category with an invalid userId', async () => {
        // User を作成
        const user = await db.user.create({
            data: {
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: 'password123',
                provider: 'local',
            },
        })

        // 無効な userId を指定してカテゴリを作成しようとするとエラーになることを確認
        await expect(
            db.category.create({
                data: {
                    name: faker.lorem.word(),
                    userId: user.id + 1, // 存在しない userId
                },
            }),
        ).rejects.toThrowError('Foreign key constraint violated')
    })

    it('should allow multiple categories for the same user', async () => {
        const user = await db.user.create({
            data: {
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: 'password123',
                provider: 'local',
            },
        })

        const category1 = await db.category.create({
            data: {
                name: faker.lorem.word(),
                userId: user.id,
            },
        })

        const category2 = await db.category.create({
            data: {
                name: faker.lorem.word(),
                userId: user.id,
            },
        })

        expect(category1).toHaveProperty('id')
        expect(category2).toHaveProperty('id')
        expect(category1.userId).toBe(user.id)
        expect(category2.userId).toBe(user.id)
    })
})
