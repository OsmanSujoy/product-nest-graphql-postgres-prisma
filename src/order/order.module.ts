import { Module, forwardRef } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderResolver } from './order.resolver';
import { UserModule } from '../user/user.module';
import { CartModule } from '../cart/cart.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule, UserModule, forwardRef(() => CartModule)],
  providers: [OrderResolver, OrderService],
  exports: [OrderService],
})
export class OrderModule {}
