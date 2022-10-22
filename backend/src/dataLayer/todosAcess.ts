import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const todosTable = process.env.TODOS_TABLE
const index = process.env.TODOS_CREATED_AT_INDEX
const bucketname = process.env.ATTACHMENT_S3_BUCKET
const s3 = new AWS.S3({ signatureVersion: 'v4' })
const docClient: DocumentClient = createDynamoDBClient()

export async function createTodo(todo: TodoItem): Promise<TodoItem> {
    await docClient.put({
      TableName: todosTable,
      Item: todo
    }).promise()

    return todo
}

export async function updateTodoItems(updateTodoRequest: UpdateTodoRequest, userId: string, todoId: string): Promise<void> {
    await docClient.update({
      TableName: this.todoTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      },
      UpdateExpression: "set #name=:name, dueDate=:dueDate, done=:done",
      ExpressionAttributeValues:{
          ":name": updateTodoRequest.name,
          ":dueDate": updateTodoRequest.dueDate,
          ":done": updateTodoRequest.done
      },
      ExpressionAttributeNames: {
        "#name": "name"
      }
    }).promise()
  }

export async function deleteTodoItem(userId: string, todoId: string): Promise<void> {
    await docClient.delete({
      TableName: todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    }).promise()
}

export async function deleteTodoItemAttachment(todoKey: string): Promise<void> {
    await s3.deleteObject({
      Bucket: bucketname,
      Key: todoKey
    }).promise()
  }

export async function getAllTodosByUserId(userId: string): Promise<TodoItem[]> {
    const result = await docClient.query({
      TableName: todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
          ':userId': userId
        },
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

export async function getTodoById(todoId: string): Promise<TodoItem> {
    const result = await docClient.query({
      TableName: todosTable,
      IndexName: index,
      KeyConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
          ':todoId': todoId
        },
    }).promise()

    const items = result.Items
    if (items.length !== 0) return result.Items[0] as TodoItem
    return null
  }

export async function updateTodo(todo: TodoItem): Promise<TodoItem> {
    const result = await docClient.update({
      TableName: todosTable,
      Key: {
        userId: todo.userId,
        todoId: todo.todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
          ':attachmentUrl': todo.attachmentUrl
        },
    }).promise()

    return result.Attributes as TodoItem
  }

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}

