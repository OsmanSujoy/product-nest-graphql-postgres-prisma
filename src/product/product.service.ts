import { Injectable } from '@nestjs/common';
import { Message } from 'src/common/dto/message.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  CreateProductInput,
  ProductsListInput,
  ProductWhereUniqueInput,
  UpdateProductInput,
} from './product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async createProduct({ userId, category, ...input }: CreateProductInput) {
    try {
      return await this.prisma.product.create({
        data: {
          ...input,
          category: {
            connect: {
              id: category,
            },
          },
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

  async updateProduct({
    input,
    userId,
  }: {
    input: UpdateProductInput;
    userId: string;
  }) {
    const { id, ...rest } = input;
    try {
      return await this.prisma.product.update({
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

  async findProduct({ id }: ProductWhereUniqueInput) {
    return await this.prisma.product.findFirst({
      where: {
        id,
        productStock: {
          gt: 0,
        },
      },
    });
  }

  async findProducts(params: ProductsListInput) {
    const { skip, take, cursor, where, orderBy } = params;
    return await this.prisma.product.findMany({
      skip,
      take,
      cursor,
      where: {
        ...where,
        productStock: {
          gt: 0,
        },
      },
      orderBy,
    });
  }

  async deleteProduct({ id }: ProductWhereUniqueInput): Promise<Message> {
    try {
      await this.prisma.product.delete({
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
