import mongodb from 'mongodb'
const { ObjectId } = mongodb

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'

export const boardService = {
    remove,
    query,
    getById,
    add,
    update,
}

async function query(filterBy = {}) {
    let criteria = {}

    try {
        // if (filterBy.txt) {
        //   criteria.name = { $regex: filterBy.txt, $options: 'i' }
        // }
        // if (filterBy.labels && filterBy.labels[0]) {
        //   criteria.labels = { $in: filterBy.labels }
        // }
        // if (filterBy.inStock !== undefined) {
        //   if (filterBy.inStock === 'true') {
        //     criteria.inStock = true
        //   } else if (filterBy.inStock === 'false') {
        //     criteria.inStock = false
        //   }
        // }

        const collection = await dbService.getCollection('board')
        const boards = await collection.find(criteria).toArray()

        return boards
    } catch (err) {
        logger.error('cannot find boards', err)
        throw err
    }
}

async function getById(boardId) {
    try {
        const collection = await dbService.getCollection('board')
        const board = collection.findOne({ _id: new ObjectId(boardId) })
        return board
    } catch (err) {
        logger.error(`while finding board ${boardId}`, err)
        throw err
    }
}

async function remove(boardId) {
    try {
        const collection = await dbService.getCollection('board')
        await collection.deleteOne({ _id: new ObjectId(boardId) })
    } catch (err) {
        logger.error(`cannot remove board ${boardId}`, err)
        throw err
    }
}

async function add(board) {
    console.log('add board')
    try {
        const collection = await dbService.getCollection('board')
        await collection.insertOne(board)
        return board
    } catch (err) {
        logger.error('cannot insert board', err)
        throw err
    }
}

async function update(board) {
    const boardToSave = {...board}
    delete boardToSave._id
    try {
        const collection = await dbService.getCollection('board')
        await collection.updateOne(
            { _id: new ObjectId(board._id) },
            { $set: boardToSave }
        )
        return board
    } catch (err) {
        logger.error(`cannot update board ${board}`, err)
        throw err
    }
}