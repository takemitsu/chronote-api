import { Prisma, PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { Context } from 'hono'
import authService from '../services/authService'

const signupSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
})

const signinSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
})

const authController = {
    async signup(c: Context) {
        const result = signupSchema.safeParse(await c.req.json())
        if (!result.success) {
            return c.json({ error: result.error.issues }, 400)
        }

        const { name, email, password } = result.data
        try {
            const user = await authService.signup(name, email, password)
            return c.json(user, 201)
        } catch (error: any) {
            if (error.message === 'Email already exists') {
                return c.json({ error: 'Email already exists' }, 400)
            }
            console.error(error)
            return c.json({ error: 'Failed to create user' }, 500)
        }
    },

    async signin(c: Context) {
        const result = signinSchema.safeParse(await c.req.json())
        if (!result.success) {
            return c.json({ error: result.error.message }, 400)
        }

        const { email, password } = result.data
        try {
            const { user, token } = await authService.signin(email, password)

            return c.json({ user, token })
        } catch (error: any) {
            if (error.message === 'Invalid email or password') {
                return c.json({ error: 'Invalid email or password' }, 401)
            }
            return c.json({ error: 'Failed to sign in' }, 500)
        }
    },

    async signout(c: Context) {
        // TODO: セッションの無効化など
        return c.json({ message: 'Signed out' })
    },
}

export default authController
