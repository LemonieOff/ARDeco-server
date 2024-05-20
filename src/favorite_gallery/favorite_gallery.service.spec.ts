import { Test, TestingModule } from "@nestjs/testing";
import { FavoriteGalleryService } from "./favorite_gallery.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { FavoriteGallery } from "./models/favorite_gallery.entity";
import { Repository } from "typeorm";

describe("FavoriteGalleryService", () => {
    let service: FavoriteGalleryService;
    let favoriteGalleryRepository: Repository<FavoriteGallery>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FavoriteGalleryService,
                {
                    provide: getRepositoryToken(FavoriteGallery),
                    useValue: {
                        find: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<FavoriteGalleryService>(FavoriteGalleryService);
        favoriteGalleryRepository = module.get<Repository<FavoriteGallery>>(
            getRepositoryToken(FavoriteGallery)
        );
    });

    describe("create", () => {
        it("should create a new favorite gallery item", async () => {
            const data = {
                user_id: 1,
                gallery_id: 123,
            };
            const createdItem = new FavoriteGallery();
            Object.assign(createdItem, data, { id: 1 });

            jest.spyOn(favoriteGalleryRepository, "save").mockResolvedValue(createdItem);

            const result = await service.create(data);
            expect(result).toEqual(createdItem);
        });
    });

    describe("findAll", () => {
        it("should find all favorite gallery items (public only by default)", async () => {
            const mockGalleryItems = [
                new FavoriteGallery(),
                new FavoriteGallery(),
                new FavoriteGallery(),
            ];
            jest.spyOn(favoriteGalleryRepository, "find").mockResolvedValue(mockGalleryItems);

            const result = await service.findAll();
            expect(favoriteGalleryRepository.find).toHaveBeenCalledWith({
                where: {}, // Default to public items
            });
            expect(result).toEqual(mockGalleryItems);
        });

        it("should find favorite gallery items by user ID", async () => {
            const userId = 1;
            const mockGalleryItems = [new FavoriteGallery(), new FavoriteGallery()];
            jest.spyOn(favoriteGalleryRepository, "find").mockResolvedValue(mockGalleryItems);

            const result = await service.findAll(userId);
            expect(favoriteGalleryRepository.find).toHaveBeenCalledWith({
                where: { user_id: userId },
            });
            expect(result).toEqual(mockGalleryItems);
        });

        it("should find favorite gallery items with limit and begin_pos", async () => {
            const userId = 1;
            const limit = 2;
            const beginPos = 1;
            const mockGalleryItems = [new FavoriteGallery(), new FavoriteGallery()];
            jest.spyOn(favoriteGalleryRepository, "find").mockResolvedValue(mockGalleryItems);

            const result = await service.findAll(userId, limit, beginPos);
            expect(favoriteGalleryRepository.find).toHaveBeenCalledWith({
                where: { user_id: userId },
                take: limit,
                skip: beginPos,
            });
            expect(result).toEqual(mockGalleryItems);
        });
    });

    describe("findOne", () => {
        it("should find a favorite gallery item by ID", async () => {
            const where = {
                user_id: 1,
                gallery_id: 123,
            };
            const mockGalleryItem = new FavoriteGallery();
            jest.spyOn(favoriteGalleryRepository, "findOne").mockResolvedValue(mockGalleryItem);

            const result = await service.findOne(where);
            expect(favoriteGalleryRepository.findOne).toHaveBeenCalledWith({ where });
            expect(result).toEqual(mockGalleryItem);
        });
    });


    describe("delete", () => {
        it("should delete a favorite gallery item by gallery ID", async () => {
            const galleryId = 123;
            const deleteResult = {
                raw: [],
                affected: 1,
            };
            jest.spyOn(favoriteGalleryRepository, "delete").mockResolvedValue(
                deleteResult
            );

            const result = await service.delete(galleryId);
            expect(favoriteGalleryRepository.delete).toHaveBeenCalledWith({
                gallery_id: galleryId,
            });
            expect(result).toEqual(deleteResult);
        });
    });
});
