import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService {
  private pool: Pool;


  constructor(private config: ConfigService) {
  let connectionString = config.get('DATABASE_URL')

    this.pool = new Pool({
      connectionString
    });
  }

  async query(text: string, params?: any[]): Promise<any> {
    return this.pool.query(text, params);
  }
}
