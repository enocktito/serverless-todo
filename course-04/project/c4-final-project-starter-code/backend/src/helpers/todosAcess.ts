import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
// import { bool } from 'aws-sdk/clients/signer'
// import { TodoUpdate } from '../models/TodoUpdate';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

const XAWS = AWSXRay.captureAWS(AWS)

// const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {

    constructor(
      private readonly docClient: DocumentClient = createDynamoDBClient(),
      private readonly todosTable = process.env.TODOS_TABLE) {
    }
  
    async getTodosForUser(userId:string): Promise<TodoItem[]> {
      console.log('Getting all todos')
  
      const result = await this.docClient.scan({
        TableName: this.todosTable,
        FilterExpression: 'userId = :id',
        ExpressionAttributeValues : {':id' : userId}
      }).promise()
  
      const items = result.Items
      return items as TodoItem[]
    }
    async createTodo(todo: TodoItem) {
        await this.docClient.put({
          TableName: this.todosTable,
          Item: todo
        }, (err) => {
            if (err) {
                console.log("Error code : " + err.code + " Error message: " + err.message);
                throw err;
            }
        }).promise()

        return todo
    }
    async deleteTodo(todoId: string, userId: string): Promise<string>  {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        }, (err) => {
            if (err) {
                console.log("Error code : " + err.code + " Error message: " + err.message);
                throw err;
            }
        }
    ).promise()

        return ''
    }

    async updateTodo(updateTodoRequest: UpdateTodoRequest,todoId: string, userId: string): Promise<string>  {
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
            if (err) {
                console.log("Error code : " + err.code + " Error message: " + err.message);
                throw err;
            }
            console.log("We are outside of error oh !!!")
        }
    ).promise()

        return ''
    }

}


function createDynamoDBClient() {
    return new XAWS.DynamoDB.DocumentClient()
  }