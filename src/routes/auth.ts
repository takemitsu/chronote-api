import { Hono } from 'hono'
import authController from '../controllers/auth'

const router = new Hono()

router.post('/signup', authController.signup)
router.post('/signin', authController.signin)
// router.post('/google', authController.google)
// router.post('/apple', authController.apple)
router.post('/signout', authController.signout)

export default router
