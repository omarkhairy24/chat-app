import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/db/db.providers';

@Injectable()
export class GroupsService {
    constructor(private db:DatabaseService){}

    async createGroup(adminId:string,name:string,cover:string){
        const group = await this.db.query(`
                INSERT INTO groups (name,cover,admin_id)
                VALUES ($1,$2,$3)
                RETURNING *;
            `,[name,cover,adminId]);

        return group.rows;
    }

    async addMembersSearch(query:string,group_id){
        const search = await this.db.query(`
                SELECT id,name,username,image
                FROM users
                WHERE (username LIKE $1 OR name LIKE $1) 
                AND id NOT IN(
                SELECT admin_id FROM groups WHERE id = $2
                UNION
                SELECT user_id FROM group_users WHERE group_id = $2
            )`,[`${query}%`,group_id]);

        return search.rows
    }

    async addMember(group_id:string,user_id:string){
        const group = await this.db.query(`
            INSERT INTO group_users (group_id, user_id)
            SELECT $1, $2
            FROM groups
            WHERE groups.id = $1
            RETURNING *;
            `,[group_id,user_id]
        );

        if(group.rowCount === 0) throw new BadRequestException('something went wrong');

        return group.rows;
    }

    async getGroupMembers(group_id:string){
        const members = await this.db.query(`
                SELECT
                users.id,
                users.username AS member_username,
                users.name AS member_name,
                users.image AS member_image
                FROM group_users
                JOIN users ON users.id = group_users.user_id
                JOIN groups ON groups.id = group_users.group_id
                WHERE group_users.group_id = $1;
            `,[group_id]);

        const admin = await this.db.query(`
                SELECT
                users.id,
                users.username AS admin_username,
                users.name AS admin_name,
                users.image AS admin_image
                FROM groups
                JOIN users ON users.id = groups.admin_id
                WHERE groups.id = $1;
            `,[group_id]);
        return [{admin:admin.rows} ,{members:members.rows}];
    }

    async getGroupChat(group_id:number){
        const groupInfo = await this.db.query(`
                SELECT name,cover FROM groups
                WHERE id = $1
            `,[group_id]);

        const groupMessages = await this.db.query(`
            SELECT messages.id, messages.message, messages.image as message_image,TO_CHAR(messages.created_at, 'YYYY-MM-DD HH24:MI') AS created_at,
                 users.username, users.name, users.image as user_image
            FROM messages
            RIGHT JOIN users ON messages.sender_id = users.id
            WHERE messages.group_id = $1
          `,[group_id]);
    
        return [groupInfo.rows,groupMessages.rows];
      }

      async getGroups(user_id:string){
        const groups = await this.db.query(`
                SELECT DISTINCT id, name, cover 
                FROM groups 
                WHERE admin_id = $1
                UNION
                SELECT DISTINCT groups.id, groups.name, groups.cover 
                FROM groups
                JOIN group_users ON group_users.group_id = groups.id 
                WHERE group_users.user_id = $1;
            `,[user_id]);

        return groups.rows;
      }
}
