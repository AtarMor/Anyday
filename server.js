import http from 'http'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import { logger } from './services/logger.service.js'
logger.info('server.js loaded...')

const app = express()
const server = http.createServer(app)


// Express App Config
app.use(cookieParser())
app.use(express.json())
app.use(express.static('public'))


if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'public')))
    // console.log('__dirname: ', __dirname)
} else {
    const corsOptions = {

        origin: [
            'http://127.0.0.1:5173',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://localhost:3000',
            'http://127.0.0.1:8080',
            'http://localhost:8080',
        ],
        credentials: true
    }
    app.use(cors(corsOptions))
}

import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { boardRoutes } from './api/board/board.routes.js'


import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'
import { setupSocketAPI } from './services/socket-service.js'

app.all('*', setupAsyncLocalStorage)
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/board', boardRoutes)

setupSocketAPI(server)


app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = process.env.PORT || 3030

server.listen(port, () => {
    logger.info('Server is running on port: ' + port)
})