import { Test, TestingModule } from '@nestjs/testing';
import { Chance } from 'chance';
import { CategoryService } from '../category/category.service';
import { message, product, user, category } from '../common/test/test.dto';
import { UserService } from '../user/user.service';
import {
  CreateProductInput,
  ProductsListInput,
  ProductWhereUniqueInput,
  UpdateProductInput,
} from './product.dto';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';

const chance = new Chance();

const createProductInput: CreateProductInput = {
  productName: chance.string(),
  productDescription: chance.string(),
  productStock: chance.integer({ min: 1, max: 20 }),
  productPrice: chance.integer({ min: 1, max: 20 }),
  category: category.id,
  userId: user.id,
};

describe('ProductResolver', () => {
  let resolver: ProductResolver;
  const mockService = {
    createProduct: jest.fn().mockReturnValueOnce(product),
    updateProduct: jest.fn((data) => {
      if (product.id === data.input.id) {
        product.productPrice = data.input.productPrice;
        return product;
      } else {
        return null;
      }
    }),
    findProducts: jest.fn((data) => {
      if (data.cursor.id === product.id) {
        return [product];
      } else {
        return [];
      }
    }),
    findProduct: jest.fn((data) => {
      if (data.id && data.id === product.id) {
        return product;
      } else {
        return null;
      }
    }),
    deleteProduct: jest.fn((data) => {
      if (data.id && data.id === product.id) {
        return message;
      } else {
        return null;
      }
    }),
  };
  const mockUserService = {
    findUser: jest.fn().mockReturnValueOnce(user),
  };
  const mockCategoryService = {
    findCategory: jest.fn().mockReturnValueOnce(category),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductResolver,
        { provide: ProductService, useValue: mockService },
        { provide: UserService, useValue: mockUserService },
        { provide: CategoryService, useValue: mockCategoryService },
      ],
    }).compile();

    resolver = module.get<ProductResolver>(ProductResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should be able to create a product', async () => {
    const result = await resolver.createProduct(createProductInput, user);
    expect(result).toBeDefined();
    expect(result).toMatchObject(product);
  });

  it('should be able to update product', async () => {
    const updateUserInput: UpdateProductInput = {
      id: product.id,
      productPrice: chance.integer({ min: 51, max: 100 }),
      ...createProductInput,
    };
    const result = await resolver.updateProduct(updateUserInput, user);
    expect(result).toBeDefined();
    expect(result.productPrice).toBe(updateUserInput.productPrice);
  });

  it('should be able to list all products', async () => {
    const input: ProductsListInput = {
      skip: 0,
      take: 10,
      cursor: {
        id: product.id,
      },
    };
    const result = await resolver.findProducts(input);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].id).toBe(product.id);
  });

  it('should be able to find one product by unique parameters', async () => {
    const input: ProductWhereUniqueInput = {
      id: product.id,
    };
    const result = await resolver.findProduct(input);
    expect(result).toBeDefined();
    expect(result.productName).toBe(product.productName);
  });

  it('should be able to delete a product ', async () => {
    const input: ProductWhereUniqueInput = {
      id: product.id,
    };
    const result = await resolver.deleteProduct(input);
    expect(result).toBeDefined();
    expect(result).toEqual(message);
    expect(result).toHaveProperty('message', message.message);
  });
});
