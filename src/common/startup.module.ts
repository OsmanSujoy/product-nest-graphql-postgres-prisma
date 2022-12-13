import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma.module';
import { StartupService } from './start/startup.service';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [StartupService],
  exports: [StartupService],
})
export class StartupModule {}
