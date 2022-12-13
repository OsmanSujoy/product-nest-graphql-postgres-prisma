import {
  INestApplication,
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  RequestTimeoutException,
  InternalServerErrorException,
  PayloadTooLargeException,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  async prismaErrors(error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (
        [
          'P1012',
          'P1016',
          'P2005',
          'P2006',
          'P2009',
          'P2019',
          'P2010',
          'P2012',
          'P2013',
        ].indexOf(error.code) >= 0
      ) {
        throw new BadRequestException(error.meta.cause);
      }
      if (['P2001', 'P2015', 'P2018', 'P2025'].indexOf(error.code) >= 0) {
        throw new NotFoundException(error.meta.cause);
      }
      if (['P2002', 'P2003', 'P2034'].indexOf(error.code) >= 0) {
        throw new ConflictException(error.meta.cause);
      }
      if (['P1010', 'P2020'].indexOf(error.code) >= 0) {
        throw new ForbiddenException(error.meta.cause);
      }
      if (['P1002', 'P1008', 'P2024'].indexOf(error.code) >= 0) {
        throw new RequestTimeoutException(error.meta.cause);
      }
      if (['P2030', 'P2031'].indexOf(error.code) >= 0) {
        throw new InternalServerErrorException(error.meta.cause);
      }
      if (['P2033'].indexOf(error.code) >= 0) {
        throw new PayloadTooLargeException(error.meta.cause);
      }
    }
  }
}
