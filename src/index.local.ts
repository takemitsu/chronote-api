import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import router from './routes'
import * as dotenv from 'dotenv'
// .env ファイルを読み込む
dotenv.config()

const app = new Hono()

app.get('/', (c) => {
    return c.text('Hello Hono!')
})

app.route('/api', router)

// NODE_ENV が test の場合は serve しない
if (process.env.NODE_ENV !== 'test') {
    const port = 3000
    console.log(`Server started at http://localhost:${port}`)

    serve({
        fetch: app.fetch,
        port,
    })
}

export { app }
