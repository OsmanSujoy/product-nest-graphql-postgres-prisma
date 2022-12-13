import { Injectable } from '@nestjs/common';
import { Message } from '../common/dto/message.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  CategoriesListInput,
  CategoryWhereUniqueInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from './category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async createCategory({ userId, ...input }: CreateCategoryInput) {
    try {
      return await this.prisma.category.create({
        data: {
          ...input,
          createdByUser: {
            connect: {
              id: userId,
            },
          },
          updatedByUser: {
            connect: {
              id: userId,
            },
          },
        },
        include: {
          createdByUser: true,
          updatedByUser: true,
        },
      });
    } catch (error) {
      await this.prisma.prismaErrors(error);
    }
  }

  async updateCategory({
    input,
    userId,
  }: {
    input: UpdateCategoryInput;
    userId: string;
  }) {
    const { id, ...rest } = input;

    try {
      return await this.prisma.category.update({
        data: {
          ...rest,
          updatedByUser: {
            connect: {
              id: userId,
            },
          },
        },
        where: {
          id,
        },
      });
    } catch (error: any) {
      await this.prisma.prismaErrors(error);
    }
  }

  async findCategory({ id }: CategoryWhereUniqueInput) {
    return await this.prisma.category.findFirst({
      where: {
        id,
      },
    });
  }

  async findCategories(params: CategoriesListInput) {
    const { skip, take, cursor, where, orderBy } = params;
    return await this.prisma.category.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async deleteCategory({ id }: CategoryWhereUniqueInput): Promise<Message> {
    try {
      await this.prisma.category.delete({
        where: {
          id,
        },
      });
      return { message: 'Success' } as Message;
    } catch (error: any) {
      return { message: error.meta?.cause } as Message;
    }
  }
}
