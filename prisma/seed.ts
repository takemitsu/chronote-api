import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 既存のデータ削除は本番でうっかり実行するかもなので行わない。（サンプル的に残しておく）
  // await prisma.anniversary.deleteMany()
  // await prisma.category.deleteMany()
  // await prisma.user.deleteMany()
  
  const user1 = await prisma.user.upsert({
    where: {email: 'testuser@example.com'},
    update: {
      name: 'Test User',
      email: 'testuser@example.com',
      provider: 'google',
      providerId: 'google-123456',
    },
    create: {
      name: 'Test User',
      email: 'testuser@example.com',
      provider: 'google',
      providerId: 'google-123456',
    }
  })
  const category1 = await prisma.category.create({
    data: {
      name: 'Personal',
      userId: user1.id
    }
  })
  await prisma.anniversary.create({
    data: {
      name: '記念日',
      date: new Date('2024-11-01').toISOString(),
      userId: user1.id,
      categoryId: category1.id,
    }
  })
}

main().catch(async (e) => {
  console.error(e)
}).finally(async () => {
  await prisma.$disconnect()
})
