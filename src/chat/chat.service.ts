import { Injectable, NotFoundException } from '@nestjs/common';
import {DatabaseService} from '../db/db.providers';

@Injectable()
export class ChatService {
  constructor(
    private db:DatabaseService
  ){}

  async sendMessage(sender_id:string,reciever_id:string,content:string,image:string[]){
      let chat = await this.db.query(
      `SELECT id FROM chats
       WHERE (userone = $1 AND usertwo = $2)
          OR (userone = $2 AND usertwo = $1)`,
      [sender_id, reciever_id]
      );
      if(chat.rows.length === 0) throw new NotFoundException('the user is not in your contacts');

      const message = await this.db.query(
        `
          INSERT INTO messages(chat_id,sender_id,message,image)
          VALUES ($1,$2,$3,$4)
          RETURNING ( SELECT name FROM users WHERE id = $2 )as name,
          ( SELECT username FROM users WHERE id = $2) as username,
          ( SELECT image FROM users WHERE id = $2 ) as user_image
          ,message ,image,TO_CHAR(created_at,'YYYY-MM-DD HH24:MI') as created_at ;
        `,
        [chat.rows[0].id,sender_id,content,image]
      );

      return message.rows;
  }

  async getChat(user_one:string,user_two:string){
    const chat = await this.db.query(
      ` SELECT chats.id, users.id as user_id,users.name, users.username, users.image,TO_CHAR(users.created_at, 'YYYY-MM-DD') AS created_at
        FROM chats
        JOIN users ON (users.id = chats.userone AND users.id <> $1)
           OR (users.id = chats.usertwo AND users.id <> $1)
        WHERE (chats.userone = $1 AND chats.usertwo = $2)
           OR (chats.userone = $2 AND chats.usertwo = $1)`,
      [user_one, user_two]
    );

    const messages = await this.db.query(
    `
      SELECT messages.id, messages.message, messages.image as message_image,TO_CHAR(messages.created_at, 'YYYY-MM-DD HH24:MI') AS created_at,
             users.username, users.name, users.image as user_image
      FROM messages
      RIGHT JOIN users ON messages.sender_id = users.id
      WHERE messages.chat_id = $1
    `,
    [chat.rows[0].id]
  );

    return[chat.rows[0], messages.rows];

  }


  async getChats(user_one:string){
    const chats = await this.db.query(
      `
        SELECT chats.id,users.id AS user_id, users.name, users.image as user_image, latest_message.message ,latest_message.image as message_image
        FROM chats
        JOIN users ON (users.id = chats.userone AND users.id <> $1)
                  OR (users.id = chats.usertwo AND users.id <> $1)
        JOIN LATERAL (
          SELECT message,image
          FROM messages
          WHERE messages.chat_id = chats.id
          ORDER BY messages.created_at DESC
          LIMIT 1
        ) AS latest_message ON true
        WHERE chats.userone = $1 OR chats.usertwo = $1
      `,
      [user_one]
    );


      return chats.rows;
  }

  async getContacts(userone:string){
    const contacts = await this.db.query(`
        SELECT chats.id, users.id as user_id,users.name,users.username, users.image as user_image
        FROM chats
        JOIN users ON (users.id = chats.userone AND users.id <> $1) OR (users.id = chats.usertwo AND users.id <> $1)
        WHERE chats.userone = $1 OR chats.usertwo = $1
      `,[userone])

    return contacts.rows;
  }

}
