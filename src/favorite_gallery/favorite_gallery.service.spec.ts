import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { FavoriteGalleryService } from "./favorite_gallery.service";
import { Repository } from "typeorm";
import { FavoriteGallery } from "./models/favorite_gallery.entity";
import { DeepPartial } from "typeorm/common/DeepPartial";

describe("FavoriteGalleryService", () => {
    let service: FavoriteGalleryService;
    let repository: Repository<FavoriteGallery>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FavoriteGalleryService,
                {
                    provide: getRepositoryToken(FavoriteGallery),
                    useClass: Repository
                }
            ]
        }).compile();

        service = module.get<FavoriteGalleryService>(FavoriteGalleryService);
        repository = module.get<Repository<FavoriteGallery>>(getRepositoryToken(FavoriteGallery));
    });

    describe("create", () => {
        it("should create a new favorite gallery item", async () => {
            const data: DeepPartial<FavoriteGallery> = { user_id: 1, gallery_id: 2 };
            const savedItem: FavoriteGallery = { ...data, id: 1, timestamp: new Date() } as FavoriteGallery;

            jest.spyOn(repository, "save").mockResolvedValue(savedItem);

            const result = await service.create(data);

            expect(result).toEqual(savedItem);
            expect(repository.save).toHaveBeenCalledWith(data);
        });
    });

    describe("findAll", () => {
        it("should find all favorite gallery items with given criteria", async () => {
            const items: FavoriteGallery[] = [
                { id: 1, user_id: 1, gallery_id: 2, timestamp: new Date() } as FavoriteGallery,
                { id: 2, user_id: 3, gallery_id: 4, timestamp: new Date() } as FavoriteGallery
            ];

            jest.spyOn(repository, "find").mockResolvedValue(items);

            const result = await service.findAll({}, {}, {});

            expect(result).toEqual(items);
            expect(repository.find).toHaveBeenCalledWith(expect.objectContaining({}));
        });
    });

    describe("findOne", () => {
        it("should find one favorite gallery item with given criteria", async () => {
            const item: FavoriteGallery = {
                id: 1,
                user_id: 1,
                gallery_id: 2,
                timestamp: new Date()
            } as FavoriteGallery;

            jest.spyOn(repository, "findOne").mockResolvedValue(item);

            const result = await service.findOne({ id: 1 });

            expect(result).toEqual(item);
            expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        });
    });

    describe("delete", () => {
        it("should delete a favorite gallery item by id", async () => {
            const deleteResult = { affected: 1 };

            jest.spyOn(repository, "delete").mockResolvedValue(deleteResult as any);

            const result = await service.delete(1);

            expect(result).toEqual(deleteResult);
            expect(repository.delete).toHaveBeenCalledWith({ gallery_id: 1 });
        });
    });
});
