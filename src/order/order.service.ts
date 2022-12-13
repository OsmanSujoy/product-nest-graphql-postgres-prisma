import {
  Injectable,
  NotFoundException,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { CartService } from '../cart/cart.service';
import { Message } from '../common/dto/message.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  OrderWhereUniqueInput,
  OrdersListInput,
  UpdateOrderInput,
} from './order.dto';
import { OrderStatus } from './order.enum';

@Injectable()
export class OrderService {
  constructor(
    @Inject(forwardRef(() => CartService))
    private cartService: CartService,
    private prisma: PrismaService,
  ) {}

  async createOrder({ orderedBy }: { orderedBy: string }) {
    const iteams = await this.cartService.findCarts({
      where: {
        cartedBy: orderedBy,
        status: false,
      },
    });
    if (iteams.length == 0) {
      throw new NotFoundException(`Cart is empty`);
    }

    const products: object[] = [];
    iteams.forEach((each) => {
      products.push({ id: each.id });
    });

    try {
      await this.prisma.cart.updateMany({
        where: {
          cartedBy: orderedBy,
          status: false,
        },
        data: {
          status: true,
        },
      });

      return await this.prisma.order.create({
        data: {
          orderedBy,
          orderedProducts: {
            connect: [...products],
          },
        },
        include: {
          orderedProducts: true,
        },
      });
    } catch (error) {
      return await this.prisma.prismaErrors(error);
    }
  }

  async updateOrder({ id, status }: UpdateOrderInput) {
    if ((<any>Object).values(OrderStatus).includes(status)) {
      try {
        return await this.prisma.order.update({
          where: { id },
          data: {
            status,
          },
        });
      } catch (error) {
        await this.prisma.prismaErrors(error);
      }
    }
    throw new BadRequestException('Invalid status');
  }

  async findOrder({ id }: OrderWhereUniqueInput) {
    return await this.prisma.order.findFirst({
      where: {
        id,
      },
    });
  }

  async findOrders(params: OrdersListInput) {
    const { skip, take, cursor, where, orderBy } = params;
    const result = await this.prisma.order.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
    return result;
  }

  async deleteOrder({ id }: OrderWhereUniqueInput) {
    try {
      await this.prisma.order.delete({
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
