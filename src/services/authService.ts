import { Prisma, PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// JWT のシークレットキー
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

const authService = {
    async signup(name: string, email: string, password: string) {
        try {
            const hashPassword = await bcrypt.hash(password, 10)
            return await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashPassword,
                    provider: 'local',
                },
            })
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new Error('Email already exists')
            }
            console.error(error)
            throw new Error('Failed to create user data')
        }
    },

    async signin(email: string, password: string) {
        const user = await prisma.user.findUnique({ where: { email: email } })
        if (!user || user.provider !== 'local' || !user.password) {
            throw new Error('Invalid email or password')
        }
        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
            throw new Error('Invalid email or password')
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })

        return { user, token }
    },

    // 実装省略
    // async signout(c: Context) {
    //     return c.json({ message: 'Signed out' })
    // }
}

export default authService
