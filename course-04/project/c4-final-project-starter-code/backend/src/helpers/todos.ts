import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

// TODO: Implement businessLogic
const todosAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();
const logger = createLogger('Todo')

export async function getTodosForUser(userId:string): Promise<TodoItem[]> {
  logger.info("Getting todo for user: " + userId);
    return todosAccess.getTodosForUser(userId)
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
  ) {
    logger.info("Creating todo: " + createTodoRequest + " for user " + userId);
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
  }

export async function deleteTodo(
    todoId: string,
    userId: string
  ) {
    logger.info("Deleting todo: " + todoId + "for user: " + userId);
    return todosAccess.deleteTodo(todoId, userId)
  }

export async function updateTodo(
    updateTodoRequest: UpdateTodoRequest,
    todoId: string, 
    userId: string
  ) {
      logger.info("Updating todo " + todoId + "with values: " + updateTodoRequest + "for user: " + userId);
      return todosAccess.updateTodo(updateTodoRequest,todoId,userId)
  }

export function createAttachmentPresignedUrl(
  todoId: string
  ) {
  logger.info("Creating attachement presigned url for the todo: " + todoId);
  return attachmentUtils.getUploadUrl(todoId)
}

  
