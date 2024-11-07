import { Hono } from 'hono'
import anniversaryController from '../controllers/anniversaries'
import { userIdMiddleware } from '../middlewares/userIdMiddleware'

const router = new Hono()

router.use('*', userIdMiddleware())

router.get('/', anniversaryController.getAll)
router.post('/', anniversaryController.create)
router.get('/:id', anniversaryController.get)
router.put('/:id', anniversaryController.update)
router.delete('/:id', anniversaryController.delete)

export default router
