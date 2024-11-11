import { Hono } from 'hono'

import authRouter from './auth'
import userRouter from './users'
import categoryRouter from './categories'
import anniversaryRouter from './anniversaries'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = new Hono()

router.route('/auth', authRouter)

// 認証が必要なルートに authMiddleware を適用する
router.use('/users/*', authMiddleware())
router.use('/categories/*', authMiddleware())
router.use('/anniversaries/*', authMiddleware())

router.route('/users', userRouter)
router.route('/categories', categoryRouter)
router.route('/anniversaries', anniversaryRouter)

export default router
