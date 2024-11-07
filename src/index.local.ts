import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import router from './routes'

const app = new Hono()

app.get('/', (c) => {
    return c.text('Hello Hono!')
})

app.route('/api', router)

const port = 3000
console.log(`Server started at http://localhost:${port}`)

serve({
    fetch: app.fetch,
    port,
})
