import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../common/prisma/prisma.service';
import Chance from 'chance';
import { message, product, user } from '../common/test/test.dto';
import { CreateProductInput, UpdateProductInput } from './product.dto';
import { ProductService } from './product.service';

const chance = new Chance();

const createProductInput: CreateProductInput = {
  productName: product.productName,
  productDescription: product.productDescription,
  productStock: product.productStock,
  productPrice: product.productPrice,
  category: product.category,
  userId: product.createdBy,
};

describe('ProductService', () => {
  let service: ProductService;

  const mockPrisma = {
    product: {
      create: jest.fn().mockReturnValueOnce(product),
      update: jest.fn((data) => {
        if (data.where.id == product.id) {
          product.productDescription = data.data.productDescription;
          return product;
        } else {
          return null;
        }
      }),
      findFirst: jest.fn((data) => {
        if (data.where.id == product.id) {
          return product;
        } else {
          return null;
        }
      }),
      findMany: jest.fn((data) => {
        if (
          data.where &&
          data.where.productDescription &&
          data.where.productDescription == product.productDescription
        ) {
          return [product];
        }
        if (data.cursor && data.cursor.id && data.cursor.id == product.id) {
          return [product];
        } else {
          return [];
        }
      }),
      delete: jest.fn().mockResolvedValue((data) => {
        if (data.where.id == product.id) {
          return createProductInput;
        } else {
          return null;
        }
      }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a product with CreateProductInput', async () => {
    const result = await service.createProduct(createProductInput);
    expect(result).toBeDefined();
    expect(result).toMatchObject(product);
  });

  it('should be able to  update some product properties', async () => {
    const newDescription = chance.string();
    const updateProductInput: UpdateProductInput = {
      id: product.id,
      productDescription: newDescription,
    };
    const result = await service.updateProduct({
      input: updateProductInput,
      userId: user.id,
    });
    expect(result).toBeDefined();
    expect(result.productDescription).toBe(newDescription);
  });

  it('should not be able to update some product properties', async () => {
    try {
      const newDescription = chance.string();
      const updateProductInput: UpdateProductInput = {
        id: chance.guid(),
        productDescription: newDescription,
      };
      await service.updateProduct({
        input: updateProductInput,
        userId: user.id,
      });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(400);
    }
  });

  it('should be able to find one by unique parameter', async () => {
    const result = await service.findProduct({ id: product.id });
    expect(result).toBeDefined();
    expect(result.productName).toBe(product.productName);
  });

  it('should be able to find product list by different parameters', async () => {
    let productList = await service.findProducts({
      skip: 0,
      take: 10,
      cursor: {
        id: product.id,
      },
    });
    expect(productList).toBeDefined();
    expect(productList).toHaveLength(1);
    expect(productList[0]).toMatchObject(product);
    expect(productList[0]).toHaveProperty('productName', product.productName);

    productList = await service.findProducts({
      skip: 0,
      take: 10,
      where: {
        productDescription: product.productDescription,
      },
    });
    expect(productList).toBeDefined();
    expect(productList).toHaveLength(1);
    expect(productList[0]).toEqual(product);
    expect(productList[0]).toHaveProperty('productName', product.productName);
  });

  it('should be not able to find product list by different parameters', async () => {
    try {
      await service.findProducts({
        skip: 0,
        take: 10,
        cursor: {
          id: chance.guid(),
        },
      });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }

    try {
      await service.findProducts({
        skip: 0,
        take: 10,
        where: {
          productDescription: chance.string(),
        },
      });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }
  });

  it('should be able to delete one by unique parameter', async () => {
    const result = await service.deleteProduct({ id: product.id });
    expect(result).toBeDefined();
    expect(result).toEqual(message);
    expect(result).toHaveProperty('message', message.message);
  });

  it('should not be able to delete one by unique parameter', async () => {
    try {
      await service.deleteProduct({ id: chance.guid() });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }
  });
});
