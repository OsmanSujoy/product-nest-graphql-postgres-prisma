import { Module, forwardRef } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductResolver } from './product.resolver';
import { UserModule } from 'src/user/user.module';
import { CommonModule } from 'src/common/common.module';
import { CategoryModule } from 'src/category/category.module';

@Module({
  imports: [UserModule, CommonModule, forwardRef(() => CategoryModule)],
  providers: [ProductResolver, ProductService],
  exports: [ProductService],
})
export class ProductModule {}
