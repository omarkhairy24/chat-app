import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/db/db.providers';

@Injectable()
export class PendingService {
    constructor(private db:DatabaseService){}

    async addToContacts(sender:string,reciever:string){
        const user = await this.db.query(
            `
                SELECT id,username,name,image FROM users WHERE id = $1
            `
        ,[reciever]);

        if(user.rows.length === 0) throw new NotFoundException('user not found');

        const pending = await this.db.query(`
                INSERT INTO pendings(sender,reciever)
                VALUES($1,$2)
                RETURNING (
                    SELECT username FROM users where id = $2
                )
            `,[sender,reciever]);

        return {message:`request sent to ${pending.rows[0].username}`};
        
    }

    async getPendigs(
        reciever:string
    ){
        const pendings = await this.db.query(`
                SELECT users.id ,users.username,users.name,users.image 
                FROM Pendings
                JOIN users ON users.id = pendings.sender
                WHERE pendings.reciever = $1
            `,[reciever]);

        return pendings.rows;
    }

    async accept(reciever:string,sender:string){
        const [query,deletePending] = await Promise.all([
            this.db.query(`
                INSERT INTO chats (userone ,usertwo)
                VALUES($1,$2)
                RETURNING (
                    SELECT username FROM users WHERE id = $2
                );
            `,[reciever,sender]),
            this.db.query(`
                DELETE FROM pendings WHERE sender = $1 AND reciever = $2
            `,[sender,reciever]),
        ]);
        return `{${query.rows[0].username} is added to your contacts}`;
    }

    async removePending(reciever:string,sender:string){
        await this.db.query(`
            DELETE FROM pendings WHERE sender = $1 AND reciever = $2
        `,[sender,reciever]);
        return `removed`;
    }

    async getSentRequests(sender:string){
        const query = await this.db.query(`
                SELECT users.username,users.name,users.image
                FROM pendings
                JOIN users ON users.id = pendings.sender
                WHERE pendings.sender = $1;
            `,[sender]);

        return query.rows;
    }
}
