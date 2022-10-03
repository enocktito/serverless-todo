import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
// import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic
const todosAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();
const bucketName = process.env.ATTACHMENT_S3_BUCKET;
const logger = createLogger('Todo')

export async function getTodosForUser(userId:string) {
  logger.info("Getting todo for user: " + userId);
    const res: any = {};
    try {
      res.body = await todosAccess.getTodosForUser(userId);
      res.statusCode = 200;
    } catch (error) {
      res.body = "Todo accessing failed."
      res.statusCode = createError[500];
    }
    return res
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
  ) {
    const res: any = {};
    logger.info("Creating todo: " + createTodoRequest + " for user " + userId);
    
    try {
      const todoId = uuid.v4();
      const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`;
      const todo = {
        todoId: todoId,
        userId: userId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl: attachmentUrl
      };
      res.body = await todosAccess.createTodo(todo);
      res.statusCode = 201;
    } catch (error) {
      res.body = "Failed to create new todoItem";
      res.statusCode = createError[500];
    }
    return res;
    
  }

export async function deleteTodo(
    todoId: string,
    userId: string
  ) {
    logger.info("Deleting todo: " + todoId + "for user: " + userId);
    const res: any = {};
    try {
      res.body = await todosAccess.deleteTodo(todoId, userId);
      res.statusCode = 200;
    } catch (error) {
      res.body = "Todo deleting failed.";
      res.statusCode = createError[500];
    }
    return res
  }

export async function updateTodo(
    updateTodoRequest: UpdateTodoRequest,
    todoId: string, 
    userId: string
  ) {
      logger.info("Updating todo " + todoId + "with values: " + JSON.stringify(updateTodoRequest) + "for user: " + userId);
      const res: any = {};
      try {
        res.body = await todosAccess.updateTodo(updateTodoRequest,todoId,userId);
        res.statusCode = 200;
      } catch (error) {
        res.body = "Todo updating failed.";
        res.statusCode = createError[500];
      }
      return res
  }

export function createAttachmentPresignedUrl(
  todoId: string
  ) {
  logger.info("Creating attachement presigned url for the todo: " + todoId);
  const res: any = {};
  try {
    res.body = attachmentUtils.getUploadUrl(todoId);
    res.statusCode = 200;
  } catch (error) {
    res.body = "Create Attachment Presigned Url failed.";
    res.statusCode = createError[500];
  }
  return res
}

  
