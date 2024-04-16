import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import mongodb from 'mongodb'
const { ObjectId } = mongodb

export const userService = {
  add,
  getById,
  update,
  remove,
  query,
  getByUsername,
}

async function query(filterBy = {}) {
  const criteria = _buildCriteria(filterBy)
  try {
    const collection = await dbService.getCollection('user')
    var users = await collection.find(criteria).toArray()
    users = users.map(user => {
      delete user.password
      user.createdAt = new ObjectId(user._id).getTimestamp()
      return user
    })
    return users
  } catch (err) {
    logger.error('cannot find users', err)
    throw err
  }
}

async function getById(userId) {
  try {
    const collection = await dbService.getCollection('user')
    const user = await collection.findOne({ _id: new ObjectId(userId) })
    delete user.password
    return user
  } catch (err) {
    logger.error(`while finding user by id: ${userId}`, err)
    throw err
  }
}

async function getByUsername(username) {
  try {
    const collection = await dbService.getCollection('user')
    const user = await collection.findOne({ username })
    return user
  } catch (err) {
    logger.error(`while finding user by username: ${username}`, err)
    throw err
  }
}

async function remove(userId) {
  try {
    const collection = await dbService.getCollection('user')
    await collection.deleteOne({ _id: new ObjectId(userId) })
  } catch (err) {
    logger.error(`cannot remove user ${userId}`, err)
    throw err
  }
}

async function update(user) {
  try {
    const userToSave = {
      _id: new ObjectId(user._id),
      fullName: user.fullName,
      imgUrl: user.imgUrl,
    }
    const collection = await dbService.getCollection('user')
    await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
    return userToSave
  } catch (err) {
    logger.error(`cannot update user ${user._id}`, err)
    throw err
  }
}

async function add(user) {
  try {
    const userToAdd = { ...user }
    delete userToAdd._id
    const collection = await dbService.getCollection('user')
    await collection.insertOne(userToAdd)
    return userToAdd
  } catch (err) {
    logger.error('cannot add user', err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const criteria = {}
  if (filterBy.txt) {
    const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
    criteria.$or = [
      {
        username: txtCriteria,
      },
      {
        fullName: txtCriteria,
      },
    ]
  }
  return criteria
}
