import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
// import { bool } from 'aws-sdk/clients/signer'
// import { TodoUpdate } from '../models/TodoUpdate';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {

    constructor(
      private readonly docClient: DocumentClient = createDynamoDBClient(),
      private readonly todosTable = process.env.TODOS_TABLE) {
    }
  
    async getTodosForUser(userId:string): Promise<TodoItem[]> {
      logger.info("Scanning Dynamodb table");
      const result = await this.docClient.scan({
        TableName: this.todosTable,
        FilterExpression: 'userId = :id',
        ExpressionAttributeValues : {':id' : userId}
      }, (err) => { 
          treatError(err) 
      }).promise()
      logger.info("Operation terminated");
      const items = result.Items
      return items as TodoItem[]
    }

    async createTodo(todo: TodoItem) {
        logger.info("Putting Item in Dynamodb table");
        await this.docClient.put({
          TableName: this.todosTable,
          Item: todo
        }, (err) => { 
            treatError(err) 
        }).promise()
        logger.info("Operation terminated");
        return todo
    }
    async deleteTodo(todoId: string, userId: string): Promise<string>  {
        logger.info("Deleting Item in Dynamodb table");
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        }, (err) => { 
            treatError(err) 
        }).promise()
        logger.info("Operation terminated");
        return ''
    }

    async updateTodo(updateTodoRequest: UpdateTodoRequest,todoId: string, userId: string): Promise<string>  {
        logger.info("Updating Item in Dynamodb table");
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: "SET #att1 = :val1, #att2 = :val2, #att3 = :val3",
            ExpressionAttributeNames: {
                "#att1": "name",
                "#att2": "dueDate",
                "#att3": "done"
            },
            ExpressionAttributeValues: {
                ":val1": updateTodoRequest.name,
                ":val2": updateTodoRequest.dueDate,
                ":val3": updateTodoRequest.done
            }
        }, (err) => { 
            treatError(err) 
        }).promise()
        logger.info("Operation terminated");
        return ''
    }

}

function treatError(err){
    if (err) {
        logger.error("Error code : " + err.code + " Error message: " + err.message)
        throw err;
    }
}

function createDynamoDBClient() {
    return new XAWS.DynamoDB.DocumentClient()
  }