import { Hono } from 'hono'
import anniversaryController from '../controllers/anniversaries'

const router = new Hono()

router.get('/', anniversaryController.getAll)
router.post('/', anniversaryController.create)
router.get('/:id', anniversaryController.get)
router.put('/:id', anniversaryController.update)
router.delete('/:id', anniversaryController.delete)

export default router
