import { Test, TestingModule } from '@nestjs/testing';
import Chance from 'chance';
import { PrismaService } from '../common/prisma/prisma.service';
import { category, message, user } from '../common/test/test.dto';
import { CreateCategoryInput, UpdateCategoryInput } from './category.dto';
import { CategoryService } from './category.service';

const chance = new Chance();

const createCategoryInput: CreateCategoryInput = {
  categoryName: category.id,
  userId: user.id,
};
describe('CategoryService', () => {
  let service: CategoryService;
  const mockPrisma = {
    category: {
      create: jest.fn().mockReturnValue(category),
      update: jest.fn((data) => {
        if (data.where.id == category.id) {
          category.categoryName = data.data.categoryName;
          return category;
        } else {
          return null;
        }
      }),
      findFirst: jest.fn((data) => {
        if (data.where.id == category.id) {
          return category;
        } else {
          return null;
        }
      }),
      findMany: jest.fn((data) => {
        if (
          data.where &&
          data.where.categoryName &&
          data.where.categoryName == category.categoryName
        ) {
          return [category];
        }
        if (data.cursor && data.cursor.id && data.cursor.id == category.id) {
          return [category];
        } else {
          return [];
        }
      }),
      delete: jest.fn().mockResolvedValue((data) => {
        if (data.where.id == category.id) {
          return message;
        } else {
          return null;
        }
      }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should create a category with CreateCategoryInput', async () => {
    const result = await service.createCategory(createCategoryInput);
    expect(result).toBeDefined();
    expect(result).toMatchObject(category);
  });

  it('should be able to  update some category properties', async () => {
    const newCategory = chance.string();
    const updateCategoryInput: UpdateCategoryInput = {
      id: category.id,
      categoryName: newCategory,
    };
    const result = await service.updateCategory({
      input: updateCategoryInput,
      userId: user.id,
    });
    expect(result).toBeDefined();
    expect(result.categoryName).toBe(newCategory);
  });

  it('should not be able to update some category properties', async () => {
    try {
      const newCategory = chance.string();
      const updateCategoryInput: UpdateCategoryInput = {
        id: category.id,
        categoryName: newCategory,
      };
      await service.updateCategory({
        input: updateCategoryInput,
        userId: chance.guid(),
      });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(400);
    }
  });

  it('should be able to find one by unique parameter', async () => {
    const result = await service.findCategory({ id: category.id });
    expect(result).toBeDefined();
    expect(result.categoryName).toBe(category.categoryName);
  });

  it('should be able to find category list by different parameters', async () => {
    let categoriesList = await service.findCategories({
      skip: 0,
      take: 10,
      cursor: {
        id: category.id,
      },
    });
    expect(categoriesList).toBeDefined();
    expect(categoriesList).toHaveLength(1);
    expect(categoriesList[0]).toMatchObject(category);
    expect(categoriesList[0]).toHaveProperty(
      'categoryName',
      category.categoryName,
    );

    categoriesList = await service.findCategories({
      skip: 0,
      take: 10,
      where: {
        categoryName: category.categoryName,
      },
    });
    expect(categoriesList).toBeDefined();
    expect(categoriesList).toHaveLength(1);
    expect(categoriesList[0]).toEqual(category);
    expect(categoriesList[0]).toHaveProperty(
      'categoryName',
      category.categoryName,
    );
  });

  it('should be not able to find category list by different parameters', async () => {
    try {
      await service.findCategories({
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
      await service.findCategories({
        skip: 0,
        take: 10,
        where: {
          categoryName: chance.string(),
        },
      });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }
  });

  it('should be able to delete one by unique parameter', async () => {
    const result = await service.deleteCategory({ id: category.id });
    expect(result).toBeDefined();
    expect(result).toEqual(message);
    expect(result).toHaveProperty('message', message.message);
  });

  it('should not be able to delete one by unique parameter', async () => {
    try {
      await service.deleteCategory({ id: chance.guid() });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }
  });
});
