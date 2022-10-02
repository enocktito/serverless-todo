import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

// TODO: Implement businessLogic
const todosAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();

export async function getTodosForUser(userId:string): Promise<TodoItem[]> {
    return todosAccess.getTodosForUser(userId)
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
  ) {
  
    const todoId = uuid.v4();
    // const attachmentUrl = 'none';
    const todo = {
      todoId: todoId,
      userId: userId,
      createdAt: new Date().toISOString(),
      name: createTodoRequest.name,
      dueDate: createTodoRequest.dueDate,
      done: false
    };
    return await todosAccess.createTodo(todo);
      
    // return (res ? todo as TodoItem:res)
  }

export async function deleteTodo(
    todoId: string,
    userId: string
  ) {
    return todosAccess.deleteTodo(todoId, userId)
  }
export async function updateTodo(
    updateTodoRequest: UpdateTodoRequest,
    todoId: string, 
    userId: string
  ) {
      return todosAccess.updateTodo(updateTodoRequest,todoId,userId)
  }

export function createAttachmentPresignedUrl(
  todoId: string
  ) {
  return attachmentUtils.getUploadUrl(todoId)
}

  
