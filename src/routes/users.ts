import { Hono } from 'hono'
import userController from '../controllers/users'
import { userIdMiddleware } from '../middlewares/userIdMiddleware'

const router = new Hono()

router.use('*', userIdMiddleware())

router.get('/me', userController.me)

export default router
