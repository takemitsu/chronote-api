import { Hono } from 'hono'
import userController from '../controllers/users'

const router = new Hono()

router.get('/me', userController.me)

export default router
