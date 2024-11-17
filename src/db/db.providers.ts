import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

@Injectable()
export class DatabaseService {
  private pool: Pool;

  constructor(private config: ConfigService) {
    this.pool = new Pool({
      host: config.get<string>('host'),
      port: +config.get<number>('port'),
      user: config.get<string>('username') ,
      password: config.get<string>('password'),
      database: config.get<string>('DB_NAME'),
      ssl:{
        require:true,
        ca:fs.readFileSync('./ca.pem').toString()
      }
    });
  }

  async query(text: string, params?: any[]): Promise<any> {
    return this.pool.query(text, params);
  }
}
