import { Hono } from 'hono'
import categoryController from '../controllers/categories'
import { userIdMiddleware } from '../middlewares/userIdMiddleware'

const router = new Hono()

router.use('*', userIdMiddleware())

router.get('/', categoryController.getAll)
router.post('/', categoryController.create)
router.get('/:id', categoryController.get)
router.put('/:id', categoryController.update)
router.delete('/:id', categoryController.delete)

export default router
