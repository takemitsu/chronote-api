import { Hono } from 'hono'
import categoryController from '../controllers/categories'

const router = new Hono()

router.get('/', categoryController.getAll)
router.post('/', categoryController.create)
router.get('/:id', categoryController.get)
router.put('/:id', categoryController.update)
router.delete('/:id', categoryController.delete)

export default router
