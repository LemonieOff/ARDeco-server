import { Test, TestingModule } from "@nestjs/testing";
import { FavoriteFurnitureService } from "./favorite_furniture.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { FavoriteFurniture } from "./models/favorite_furniture.entity";
import { Repository } from "typeorm";

describe("FavoriteFurnitureService", () => {
    let service: FavoriteFurnitureService;
    let favoriteFurnitureRepository: Repository<FavoriteFurniture>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FavoriteFurnitureService,
                {
                    provide: getRepositoryToken(FavoriteFurniture),
                    useValue: {
                        find: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                        delete: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<FavoriteFurnitureService>(FavoriteFurnitureService);
        favoriteFurnitureRepository = module.get<Repository<FavoriteFurniture>>(getRepositoryToken(FavoriteFurniture));
    });

    describe("create", () => {
        it("should create a new favorite furniture item", async () => {
            const data = {
                user_id: 1,
                furniture_id: "FURNITURE_ID"
            };
            const createdItem = new FavoriteFurniture(); // Create a mock FavoriteFurniture entity
            Object.assign(createdItem, data, { id: 1 });

            jest.spyOn(favoriteFurnitureRepository, "save").mockResolvedValue(createdItem);

            const result = await service.create(data);
            expect(result).toEqual(createdItem);
        });
    });

    describe("findAll", () => {
        it("should find all favorite furniture items", async () => {
            const mockFurnitureItems = [
                new FavoriteFurniture(),
                new FavoriteFurniture(),
                new FavoriteFurniture()
            ];
            jest.spyOn(favoriteFurnitureRepository, "find").mockResolvedValue(mockFurnitureItems);

            const result = await service.findAll();
            expect(result).toEqual(mockFurnitureItems);
        });

        it("should find favorite furniture items by user ID", async () => {
            const userId = 1;
            const mockFurnitureItems = [new FavoriteFurniture(), new FavoriteFurniture()];
            jest.spyOn(favoriteFurnitureRepository, "find").mockResolvedValue(mockFurnitureItems);

            const result = await service.findAll(userId);
            expect(favoriteFurnitureRepository.find).toHaveBeenCalledWith({
                where: { user_id: userId }
            });
            expect(result).toEqual(mockFurnitureItems);
        });

        it("should find favorite furniture items with limit and begin_pos", async () => {
            const userId = 1;
            const limit = 2;
            const beginPos = 1;
            const mockFurnitureItems = [new FavoriteFurniture(), new FavoriteFurniture()];
            jest.spyOn(favoriteFurnitureRepository, "find").mockResolvedValue(mockFurnitureItems);

            const result = await service.findAll(userId, limit, beginPos);
            expect(favoriteFurnitureRepository.find).toHaveBeenCalledWith({
                where: { user_id: userId },
                take: limit,
                skip: beginPos
            });
            expect(result).toEqual(mockFurnitureItems);
        });
    });

    describe("findOne", () => {
        it("should find a favorite furniture item by ID", async () => {
            const where = {
                user_id: 1,
                furniture_id: 2
            };
            const mockFurnitureItem = new FavoriteFurniture();
            jest.spyOn(favoriteFurnitureRepository, "findOne").mockResolvedValue(mockFurnitureItem);

            const result = await service.findOne(where);
            expect(favoriteFurnitureRepository.findOne).toHaveBeenCalledWith({ where });
            expect(result).toEqual(mockFurnitureItem);
        });

        it("should return null if favorite furniture item is not found", async () => {
            const where = {
                user_id: 1,
                furniture_id: 3
            };
            jest.spyOn(favoriteFurnitureRepository, "findOne").mockResolvedValue(null);

            const result = await service.findOne(where);
            expect(result).toBeNull();
        });
    });

    describe("delete", () => {
        it("should delete a favorite furniture item by furniture ID", async () => {
            const furnitureId = 1;
            const deleteResult = {
                raw: [],
                affected: 1
            };
            jest.spyOn(favoriteFurnitureRepository, "delete").mockResolvedValue(deleteResult);

            const result = await service.delete(furnitureId);
            expect(favoriteFurnitureRepository.delete).toHaveBeenCalledWith({
                furniture_id: furnitureId
            });
            expect(result).toEqual(deleteResult);
        });
    });
});
