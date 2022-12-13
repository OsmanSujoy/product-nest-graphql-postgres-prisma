import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StartupService implements OnApplicationBootstrap {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const result = await this.prisma.user.findFirst({
      where: { username: 'admin' },
    });
    if (!result) {
      const saltOrRounds = 10;
      const password = await bcrypt.hash(
        this.configService.get<string>('START_UP_ADMIN_PASSWORD'),
        saltOrRounds,
      );
      await this.prisma.user.create({
        data: {
          username: this.configService.get<string>('START_UP_ADMIN_USERNAME'),
          email: this.configService.get<string>('START_UP_ADMIN_EMAIL'),
          password: password,
          roles: {
            set: 'ADMIN',
          },
        },
      });
    }
  }
}
