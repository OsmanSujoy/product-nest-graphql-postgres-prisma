import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { LogService } from '../common/logger/logger.service';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  CartsListInput,
  UpdateCartInput,
  CreateUpdateCartInput,
  CartWhereUniqueInput,
} from './cart.dto';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly logger: LogService,
  ) {}

  async createUpdateCart({ userId, quantity, product }: CreateUpdateCartInput) {
    try {
      const availableStock = await this.prisma.product.findUnique({
        where: {
          id: product,
        },
      });
      if (!availableStock || availableStock.productStock < quantity) {
        throw new BadRequestException(`Unable to add to cart`);
      }

      const getTotalOfSingleItem = quantity * availableStock.productPrice;
      if (getTotalOfSingleItem < 0) {
        throw new BadRequestException(`Unable to add to cart`);
      }

      const checkItemInCart = await this.findCarts({
        where: {
          product,
          cartedBy: userId,
          status: false,
        },
      });

      if (quantity > 0) {
        if (checkItemInCart.length == 0) {
          await this.updateStock({
            currentReserve: 0,
            newReserve: quantity,
            product,
          });

          const result = await this.prisma.cart.create({
            data: {
              quantity,
              subTotal: getTotalOfSingleItem,
              createdByUser: {
                connect: {
                  id: userId,
                },
              },
              productList: {
                connect: {
                  id: product,
                },
              },
            },
            include: {
              createdByUser: true,
              productList: true,
            },
          });

          this.timeOut({ id: result.id });
          return result;
        } else {
          await this.updateStock({
            currentReserve: checkItemInCart[0].quantity,
            newReserve: quantity,
            product,
          });
          const result = await this.prisma.cart.update({
            where: {
              id: checkItemInCart[0].id,
            },
            data: {
              quantity,
              subTotal: getTotalOfSingleItem,
            },
          });
          this.timeOut({ id: result.id });
          return result;
        }
      }
      if (checkItemInCart.length == 0) {
        throw new BadRequestException(`Cart is already empty`);
      }
      await this.updateStock({
        currentReserve: checkItemInCart[0].quantity,
        newReserve: quantity,
        product,
      });
      const result = await this.prisma.cart.delete({
        where: {
          id: checkItemInCart[0].id,
        },
      });
      result.quantity = 0;
      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        await this.prisma.prismaErrors(error);
      }
      return error;
    }
  }

  async findCart({ id }: CartWhereUniqueInput) {
    return await this.prisma.cart.findFirst({
      where: {
        id,
      },
    });
  }

  async findCarts(params: CartsListInput) {
    const { skip, take, cursor, where, orderBy } = params;
    const result = await this.prisma.cart.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        productList: true,
      },
    });
    return result;
  }

  async updateCart({ id, quantity }: UpdateCartInput) {
    try {
      const checkItemInCart = await this.findCarts({
        where: { id, status: true },
      });
      if (
        !checkItemInCart[0].productList.productStock ||
        checkItemInCart[0].productList.productStock < quantity
      ) {
        throw new BadRequestException(`Unable to add to cart`);
      }

      await this.updateStock({
        currentReserve: checkItemInCart[0].quantity,
        newReserve: quantity,
        product: checkItemInCart[0].productList.id,
      });
      if (quantity > 0) {
        const result = await this.prisma.cart.update({
          where: {
            id,
          },
          data: {
            quantity,
            subTotal: quantity * checkItemInCart[0].productList.productPrice,
          },
        });
        this.timeOut({ id: result.id });
        return result;
      }
      const result = await this.prisma.cart.delete({
        where: {
          id,
        },
      });
      result.quantity = 0;
      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        await this.prisma.prismaErrors(error);
      }
      return error;
    }
  }

  async timeOut({ id }: CartWhereUniqueInput) {
    setTimeout(
      () => this.retriveStock({ id }),
      this.configService.get<number>('RESERVATION_TIME') * 1000,
    );
  }

  private async retriveStock({ id }: CartWhereUniqueInput) {
    const data = await this.findCarts({ where: { id, status: false } });
    if (data) {
      const timeDiff =
        new Date().getTime() - new Date(data[0].updatedAt).getTime();
      if (
        timeDiff / 1000 >
        this.configService.get<number>('RESERVATION_TIME')
      ) {
        this.logger.log('RESERVATION CLEANING', CartService.name);
        await this.prisma.cart.delete({
          where: {
            id,
          },
        });
        await this.updateStock({
          currentReserve: data[0].quantity,
          newReserve: 0,
          product: data[0].product,
        });
      } else {
        this.timeOut({ id: data[0].id });
      }
    }
  }

  private async updateStock({
    currentReserve,
    newReserve,
    product,
  }: {
    currentReserve: number;
    newReserve: number;
    product: string;
  }) {
    const newStockDiff = currentReserve - newReserve;
    return await this.prisma.product.update({
      data: {
        productStock: {
          increment: newStockDiff,
        },
      },
      where: {
        id: product,
      },
    });
  }
}
