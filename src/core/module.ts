import { DtoPipe } from '@core/pipe';
import { Module } from '@nestjs/common';
import { OrderModule } from '@modules/user';
import { RedisModule } from '@library/redis';
import { LoggerModule } from '@library/logger';
import { HealthModule } from '@modules/health';
import { ConfigModule } from '@library/configs';
import { ExceptionCatchFilter } from '@core/filter';
import { PostgresqlModule } from '@library/postgresql';
import { LogInterceptor, FormatInterceptor } from '@core/interceptor';

@Module({
  imports: [
    /**
     * The common modules
     */
    ConfigModule,
    LoggerModule,
    RedisModule,
    PostgresqlModule,
    /**
     * The server logic modules
     */
    OrderModule,
    HealthModule,
  ],
  exports: [
    /**
     * export provider
     */
    DtoPipe,
    LogInterceptor,
    FormatInterceptor,
    ExceptionCatchFilter,
  ],
  providers: [
    /**
     * context provider
     */
    DtoPipe,
    LogInterceptor,
    FormatInterceptor,
    ExceptionCatchFilter,
  ],
})

export class CoreModule {}
