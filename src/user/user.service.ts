import { Injectable,NotFoundException } from '@nestjs/common';
import {DatabaseService} from '../db/db.providers';

@Injectable()
export class UserService {
  constructor(private db:DatabaseService){}

  async find(){
    const query = await this.db.query(`SELECT username,name,email,image FROM users`);
    return query.rows;
  }


  async searchUser(searchQuery:string,me:string){
    const query = await this.db.query(`
        SELECT id,username,name,image FROM users
        WHERE (username LIKE $1 OR name LIKE $1) AND id != $2 
        AND id NOT IN (
          SELECT DISTINCT users.id
          FROM chats
          JOIN users ON chats.userone = users.id OR chats.usertwo = users.id
          WHERE chats.userone = $2 OR chats.usertwo = $2
        ) AND id NOT IN (
          SELECT DISTINCT users.id
          FROM pendings 
          JOIN users on pendings.sender = users.id OR pendings.reciever = users.id
          WHERE pendings.sender = $2 OR pendings.reciever = $2 
        )
      `,[`${searchQuery}%`,me]);
    return query.rows;
  }

  async updateUserInfo(user_id:string,name:string,image:string){
    const query = await this.db.query(`
        UPDATE users
        SET name = COALESCE ($1,name) ,image = COALESCE ($2,image)
        WHERE id = $3
        RETURNING users.name ,users.image;
      `,[name,image,user_id]);

    return query.rows
  }

  async getMe(user_id:string){
    const query = await this.db.query(
      `
        SELECT name,username,email,image FROM users
        WHERE id = $1
      `
    ,[user_id])
    return query.rows[0]
  }
}
