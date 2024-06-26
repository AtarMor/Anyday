import { Server } from 'socket.io'
import { logger } from './logger.service.js'

var gIo = null

export const SOCKET_EVENT_SET_BOARD = 'set-board'
export const SOCKET_EVENT_SET_TASK = 'set-task'

export const SOCKET_EVENT_UPDATE_BOARD = 'update-board'
export const SOCKET_EMIT_UPDATED_BOARD = 'board-updated'

export const SOCKET_EVENT_ADD_COMMENT = 'add-comment'
export const SOCKET_EMIT_COMMENT_ADDED = 'comment-added'

export const socketService = {
  setupSocketAPI,
}

export function setupSocketAPI(server) {
  gIo = new Server(server, {
    cors: {
      origin: '*',
    },
  })

  gIo.on('connection', socket => {
    logger.info(`New connected socket[id:${socket.id}]`)
    socket.on('disconnect', socket => {
      logger.info(`socket disconnected [id:${socket.id}]`)
    })

    socket.on(SOCKET_EVENT_SET_BOARD, board => {
      if (!board) return
      if (socket.myBoard === board) return

      if (socket.myBoard) {
        socket.leave(socket.myBoard)
        logger.info(`socket is leaving board ${socket.myBoard} [id: ${socket.id}]`)
      }
      socket.join(board._id)
      socket.myBoard = board._id
    })

    socket.on(SOCKET_EVENT_SET_TASK, taskId => {
      if (socket.myTask === taskId) return
      if (socket.myTask) {
        socket.leave(socket.myTask)
        logger.info(`socket is leaving task ${socket.myTask} [id: ${socket.id}]`)
      }
      socket.join(taskId)
      socket.myTask = taskId
    })

    socket.on(SOCKET_EVENT_ADD_COMMENT, task => {
      logger.info(`Comment added from socket from socket from socket [id:${socket.id}]`)
      socket.broadcast.to(socket.myTask).emit(SOCKET_EMIT_COMMENT_ADDED, task)
    })

    socket.on(SOCKET_EVENT_UPDATE_BOARD, board => {
      logger.info(`Board updated from socket from socket [id:${socket.id}]`)
      socket.broadcast.to(socket.myBoard).emit(SOCKET_EMIT_UPDATED_BOARD, board)
    })

    socket.on('set-user-socket', userId => {
      logger.info(`Setting socket.userId = ${userId} for socket [id: ${socket.id}]`)
      socket.userId = userId
    })
    socket.on('unset-user-socket', () => {
      logger.info(`Removing socket.userId for socket [id: ${socket.id}]`)
      delete socket.userId
    })
  })
}
