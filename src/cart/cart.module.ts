import { Module, forwardRef } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartResolver } from './cart.resolver';
import { UserModule } from 'src/user/user.module';
import { ProductModule } from 'src/product/product.module';
import { OrderModule } from 'src/order/order.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    CommonModule,
    UserModule,
    ProductModule,
    forwardRef(() => OrderModule),
  ],
  providers: [CartResolver, CartService],
  exports: [CartService],
})
export class CartModule {}
