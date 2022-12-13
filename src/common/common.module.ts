import { Module } from '@nestjs/common';
import { GraphqlModule } from './graphql.module';
import { ConfigModule } from './config.module';
import { AuthModule } from './auth.module';
import { PrismaModule } from './prisma.module';
import { StartupModule } from './startup.module';
import { LoggerModule } from './logger.module';

@Module({
  imports: [
    ConfigModule,
    GraphqlModule,
    AuthModule,
    PrismaModule,
    StartupModule,
    LoggerModule,
  ],
  exports: [
    ConfigModule,
    GraphqlModule,
    AuthModule,
    PrismaModule,
    StartupModule,
    LoggerModule,
  ],
})
export class CommonModule {}
