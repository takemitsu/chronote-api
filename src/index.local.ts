import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import router from './routes'
import * as dotenv from 'dotenv'
import { cors } from 'hono/cors'
// .env ファイルを読み込む
dotenv.config()

const app = new Hono()

// CORS ミドルウェアを適用
app.use('/api/*', cors({
    origin: 'http://localhost:5173',
    credentials: true,
}))

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
