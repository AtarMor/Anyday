import { Server } from 'socket.io'
import { logger } from './logger.service'

var gIo = null

export function setupSocketAPI(server) {
    gIo = new Server(server, {
        cors: {
            origin: '*',
        }
    })
    gIo.on('connection', socket => {
        logger.info(`New connected socket[id:${socket.id}]`)
        socket.on('disconnect', socket => {
            logger.info(`socket disconnected [id:${socket.id}]`)
        })

        socket.on('conversation-set-task', task => {
            if (socket.myTask === task) return
            if (socket.myTask) {
                socket.leave(socket.myTask)
                logger.info(`socket is leaving task ${socket.myTask} [id: ${socket.id}]`)
            }
            socket.join(task)
            socket.myTask = task
        })

        socket.on('conversation-add-msg', msg => {
            logger.info(`New chat msg from socket [id:${socket.id}]`)
            socket.emit('conversation-add-msg', msg)
        })

        socket.on('set-user-socket', userId => {
            logger.info(`setting socket.userId = ${userId} for socket[id:${socket.id}]`)
            socket.userId = userId
        })
        socket.on('set-user-socket', () => {
            logger.info(`Removing socket.userId for socket [id:${socket.id}]`)
            delete socket.userId
        })
    })
}