import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosForUser as getTodosForUser } from '../../helpers/todos'
import { getUserId } from '../utils';

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    console.log(event);
    const userId = getUserId(event);
    const items = await getTodosForUser(userId);

    // const todos = {
    //     "items": [
    //     {
    //     "todoId": "123",
    //     "createdAt": "2019-07-27T20:01:45.424Z",
    //     "name": "Buy milk",
    //     "dueDate": "2019-07-29T20:01:45.424Z",
    //     "done": false,
    //     "attachmentUrl": "http://example.com/image.png"
    //     },
    //     {
    //     "todoId": "456",
    //     "createdAt": "2019-07-27T20:01:45.424Z",
    //     "name": "Send a letter",
    //     "dueDate": "2019-07-29T20:01:45.424Z",
    //     "done": true,
    //     "attachmentUrl": "http://example.com/image.png"
    //     }
    //     ]
    // }

    return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            items
        })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
