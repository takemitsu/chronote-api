import { Hono } from 'hono'

import authRouter from './auth'
import userRouter from './users'
import categoryRouter from './categories'
import anniversaryRouter from './anniversaries'

const router = new Hono()

router.route('/auth', authRouter)
router.route('/users', userRouter)
router.route('/categories', categoryRouter)
router.route('/anniversaries', anniversaryRouter)

export default router
