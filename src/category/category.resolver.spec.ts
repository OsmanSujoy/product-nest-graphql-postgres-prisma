import { Test, TestingModule } from '@nestjs/testing';
import { Chance } from 'chance';
import { ProductService } from '../product/product.service';
import { product, category, message, user } from '../common/test/test.dto';
import { UserService } from '../user/user.service';
import {
  CategoriesListInput,
  CategoryWhereUniqueInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from './category.dto';
import { CategoryResolver } from './category.resolver';
import { CategoryService } from './category.service';

const chance = new Chance();

const createCategoryInput: CreateCategoryInput = {
  categoryName: category.categoryName,
  userId: user.id,
};

describe('CategoryResolver', () => {
  let resolver: CategoryResolver;

  const mockService = {
    createCategory: jest.fn().mockReturnValue(category),
    updateCategory: jest.fn((data) => {
      if (category.id === data.input.id) {
        category.categoryName = data.input.categoryName;
        return category;
      } else {
        return null;
      }
    }),
    findCategories: jest.fn((data) => {
      if (data.cursor.id === category.id) {
        return [category];
      } else {
        return [];
      }
    }),
    findCategory: jest.fn((data) => {
      if (data.id && data.id === category.id) {
        return category;
      } else {
        return null;
      }
    }),
    deleteCategory: jest.fn((data) => {
      if (data.id && data.id === category.id) {
        return message;
      } else {
        return null;
      }
    }),
  };
  const mockUserService = {
    findUser: jest.fn().mockRejectedValue([user]),
  };
  const mockProductService = {
    findProducts: jest.fn().mockRejectedValue([product]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryResolver,
        { provide: CategoryService, useValue: mockService },
        { provide: ProductService, useValue: mockProductService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    resolver = module.get<CategoryResolver>(CategoryResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should be able to create a category', async () => {
    const result = await resolver.createCategory(createCategoryInput, user);
    expect(result).toBeDefined();
    expect(result).toMatchObject(category);
  });

  it('should be able to update category', async () => {
    const updateCategoryInput: UpdateCategoryInput = {
      id: category.id,
      categoryName: chance.string(),
    };
    const result = await resolver.updateCategory(updateCategoryInput, user);
    expect(result).toBeDefined();
    expect(result.categoryName).toBe(updateCategoryInput.categoryName);
  });

  it('should be able to list all categories', async () => {
    const input: CategoriesListInput = {
      skip: 0,
      take: 10,
      cursor: {
        id: category.id,
      },
    };
    const result = await resolver.findCategories(input);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].id).toBe(category.id);
  });

  it('should be able to find one category by unique parameters', async () => {
    const input: CategoryWhereUniqueInput = {
      id: category.id,
    };
    const result = await resolver.findCategory(input);
    expect(result).toBeDefined();
    expect(result.categoryName).toBe(category.categoryName);
  });

  it('should be able to delete a category ', async () => {
    const input: CategoryWhereUniqueInput = {
      id: category.id,
    };
    const result = await resolver.deleteCategory(input);
    expect(result).toBeDefined();
    expect(result).toEqual(message);
    expect(result).toHaveProperty('message', message.message);
  });
});
