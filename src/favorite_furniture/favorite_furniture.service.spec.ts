import { Test, TestingModule } from "@nestjs/testing";
import { FavoriteFurnitureService } from "./favorite_furniture.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { FavoriteFurniture } from "./models/favorite_furniture.entity";
import { FindOptionsWhere, Repository } from "typeorm";

describe("FavoriteFurnitureService", () => {
    let service: FavoriteFurnitureService;
    let repository: Repository<FavoriteFurniture>;

    const mockFavoriteFurniture: FavoriteFurniture = {
        id: 1,
        user_id: 1,
        furniture_id: 1,
        timestamp: new Date(),
        user: null,
        furniture: null
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FavoriteFurnitureService,
                {
                    provide: getRepositoryToken(FavoriteFurniture),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        delete: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<FavoriteFurnitureService>(FavoriteFurnitureService);
        repository = module.get<Repository<FavoriteFurniture>>(getRepositoryToken(FavoriteFurniture));
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("create", () => {
        it("should create a new favorite furniture entry", async () => {
            const data = { user_id: 1, furniture_id: 1 };
            jest.spyOn(repository, "save").mockResolvedValue(mockFavoriteFurniture as any);

            const result = await service.create(data);

            expect(repository.save).toHaveBeenCalledWith(data);
            expect(result).toEqual(mockFavoriteFurniture);
        });
    });

    describe("findAll", () => {
        it("should find all favorite furniture entries", async () => {
            const mockFavorites = [mockFavoriteFurniture, { ...mockFavoriteFurniture, id: 2 }];
            jest.spyOn(repository, "find").mockResolvedValueOnce(mockFavorites as any);

            const result = await service.findAll();

            expect(repository.find).toHaveBeenCalledWith({ where: {} });
            expect(result).toEqual(mockFavorites);
        });

        it("should find favorite furniture entries by user ID", async () => {
            const userId = 1;
            const mockFavorites = [{ ...mockFavoriteFurniture, user_id: userId }];
            jest.spyOn(repository, "find").mockResolvedValueOnce(mockFavorites as any);

            const result = await service.findAll(userId);

            expect(repository.find).toHaveBeenCalledWith({ where: { user_id: userId } });
            expect(result).toEqual(mockFavorites);
        });

        it("should find favorite furniture entries with limit and begin_pos", async () => {
            const userId = 1;
            const limit = 2;
            const beginPos = 1;
            const mockFavorites = [{ ...mockFavoriteFurniture, user_id: userId }, { ...mockFavoriteFurniture, id: 2, user_id: userId }];
            jest.spyOn(repository, "find").mockResolvedValueOnce(mockFavorites as any);

            const result = await service.findAll(userId, limit, beginPos);

            expect(repository.find).toHaveBeenCalledWith({
                where: { user_id: userId },
                take: limit,
                skip: beginPos
            });
            expect(result).toEqual(mockFavorites);
        });
    });

    describe("findOne", () => {
        it("should find a favorite furniture entry by condition", async () => {
            const where: FindOptionsWhere<FavoriteFurniture> = { user_id: 1, furniture_id: 1 };
            jest.spyOn(repository, "findOne").mockResolvedValueOnce(mockFavoriteFurniture as any);

            const result = await service.findOne(where);

            expect(repository.findOne).toHaveBeenCalledWith({ where });
            expect(result).toEqual(mockFavoriteFurniture);
        });
    });

    describe("delete", () => {
        it("should delete a favorite furniture entry by furniture ID", async () => {
            const furnitureId = 1;
            const deleteResult = { affected: 1 };
            jest.spyOn(repository, "delete").mockResolvedValueOnce(deleteResult as any);

            const result = await service.delete(furnitureId);

            expect(repository.delete).toHaveBeenCalledWith({ furniture_id: furnitureId });
            expect(result).toEqual(deleteResult);
        });
    });
});
