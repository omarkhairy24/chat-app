import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from 'src/chat/chat.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
@WebSocketGateway({ cors: true })
export class GatwayService implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private onlineUsers = new Map();

    constructor(
        private chatService: ChatService,
        private configService:ConfigService
    ) {}

    private parseCookies(cookieString: string): { [key: string]: string } {
        return cookieString
            .split(';')
            .map(cookie => cookie.trim().split('='))
            .reduce((acc, [key, value]) => {
                acc[key] = decodeURIComponent(value);
                return acc;
            }, {} as { [key: string]: string });
    }

    @SubscribeMessage('onlineFriends')
    async handleConnection(client: Socket) {
        const cookies = this.parseCookies(client.handshake.headers.cookie || '');
        const token = cookies['auth_token'];
        
        const decoded = jwt.verify(token,this.configService.get('jwtSecret'));
        const userId = decoded.sub;
        if(userId){
            this.onlineUsers.set(userId, client.id);
            console.log(`User connected: ${client.id}`);

            //@ts-ignore
            const contacts = await this.chatService.getContacts(userId);
            const onlineContacts = contacts.filter(contact => this.onlineUsers.has(contact.user_id));
            
            client.emit('onlineContacts', onlineContacts);
        }

    }

    handleDisconnect(client: Socket) {
        const userId = [...this.onlineUsers.entries()].find(([key, value]) => value === client.id)[0];
        
        if (userId) {
            this.onlineUsers.delete(userId);
            console.log(`User disconnected: ${client.id}`);
    
            const onlineContacts = [...this.onlineUsers.keys()];
            this.server.emit('userDisconnected', { userId, onlineContacts });
        }
    
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('sendMessage')
    handleMessage(client: Socket, payload: any) {
        
        this.server.emit('receiveMessage', payload);
    }


    @SubscribeMessage('notifications')
    handleNotification(client: Socket, user_id: any){
        
        const userId = [...this.onlineUsers.entries()].find(([key,value])=>{
            if(key === user_id[0]) return value
        })
        
        this.server.to(userId).emit('notification', {
            message: `New message from ${user_id[1]}`
        });
    }

    
}
