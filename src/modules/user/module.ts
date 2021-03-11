import { Module } from '@nestjs/common';
import { RedisModule } from '@library/redis';
import { ConfigModule } from '@library/configs';
import { PostgresqlModule } from '@library/postgresql';

import { UserController } from './controller';
import { UserService } from './service';
import { UserDao } from './dao';

@Module({
  imports: [
    RedisModule,
    ConfigModule,
    PostgresqlModule,
  ],
  controllers: [
    UserController,
  ],
  providers: [
    UserService,
    UserDao,
  ],
})
export class OrderModule {}
