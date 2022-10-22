import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { deleteTodoItem, deleteTodoItemAttachment, updateTodoItems } from '../dataLayer/todosAcess'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { getUserId } from '../lambda/utils'

export function todoBuilder(todoRequest: CreateTodoRequest, event: APIGatewayProxyEvent): TodoItem
{
    const todoId = uuid.v4()
    const todo = {
      todoId: todoId,
      userId: getUserId(event),
      createdAt: new Date().toISOString(),
      done: false,
      attachmenturl:'',
      ...todoRequest
    }
    return todo as TodoItem
}

export async function deleteTodoItems(userId: string, todoId: string) {

  await Promise.all([
    deleteTodoItem(userId, todoId),
    deleteTodoItemAttachment(todoId)
  ])  
}

export async function updateTodoItem(updateTodoRequest: UpdateTodoRequest, userId: string,
  todoId: string): Promise<void> {

  await updateTodoItems(updateTodoRequest, userId, todoId)
}
