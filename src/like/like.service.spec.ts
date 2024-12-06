import { Test, TestingModule } from "@nestjs/testing";
import { LikeService } from "./like.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Like } from "./models/like.entity";
import { DeleteResult, FindOptionsRelations, FindOptionsSelect, FindOptionsWhere, Repository } from "typeorm";
import { User } from "../user/models/user.entity";
import { Gallery } from "../gallery/models/gallery.entity";

describe("LikeService", () => {
    let service: LikeService;
    let likeRepository: Repository<Like>;

    const mockUser = new User();
    mockUser.id = 1;

    const mockGallery = new Gallery();
    mockGallery.id = 10;

    const mockLike: Like = {
        id: 1,
        user_id: mockUser.id,
        gallery_id: mockGallery.id,
        creation_date: new Date(),
        user: mockUser,
        gallery: mockGallery
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LikeService,
                {
                    provide: getRepositoryToken(Like),
                    useValue: {
                        save: jest.fn(),
                        findOne: jest.fn(),
                        find: jest.fn(),
                        delete: jest.fn(),
                        update: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<LikeService>(LikeService);
        likeRepository = module.get<Repository<Like>>(getRepositoryToken(Like));
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("like", () => {
        it("should create a new like", async () => {
            jest.spyOn(likeRepository, "save").mockResolvedValueOnce(mockLike as any);
            const result = await service.like(mockUser.id, mockGallery.id);
            expect(likeRepository.save).toHaveBeenCalledWith({ user_id: mockUser.id, gallery_id: mockGallery.id });
            expect(result).toEqual(mockLike);
        });
    });

    describe("unlike", () => {
        it("should remove a like", async () => {
            const deleteResult: DeleteResult = { affected: 1, raw: [] } as any;
            jest.spyOn(likeRepository, "delete").mockResolvedValueOnce(deleteResult);
            const result = await service.unlike(mockUser.id, mockGallery.id);
            expect(likeRepository.delete).toHaveBeenCalledWith({ user_id: mockUser.id, gallery_id: mockGallery.id });
            expect(result).toEqual(deleteResult);
        });
    });

    describe("isLiked", () => {
        it("should return true if liked", async () => {
            jest.spyOn(likeRepository, "findOne").mockResolvedValueOnce(mockLike as any);
            const result = await service.isLiked(mockUser.id, mockGallery.id);
            expect(likeRepository.findOne).toHaveBeenCalledWith({ where: { user_id: mockUser.id, gallery_id: mockGallery.id } });
            expect(result).toBe(true);
        });

        it("should return false if not liked", async () => {
            jest.spyOn(likeRepository, "findOne").mockResolvedValueOnce(null);
            const result = await service.isLiked(mockUser.id, mockGallery.id);
            expect(likeRepository.findOne).toHaveBeenCalledWith({ where: { user_id: mockUser.id, gallery_id: mockGallery.id } });
            expect(result).toBe(false);
        });
    });

    describe("findOne", () => {
        it("should find a like by criteria", async () => {
            const where: FindOptionsWhere<Like> = { user_id: 1 };
            const relations: FindOptionsRelations<Like> = { gallery: true };
            const select: FindOptionsSelect<Like> = { id: true };
            jest.spyOn(likeRepository, "findOne").mockResolvedValueOnce(mockLike as any);

            const result = await service.findOne(where, relations, select);

            expect(likeRepository.findOne).toHaveBeenCalledWith({
                where,
                relations,
                select,
                loadRelationIds: false,
                loadEagerRelations: false
            });
            expect(result).toEqual(mockLike);
        });
    });

    describe("findOneById", () => {
        it("should find a like by id", async () => {
            const id = 1;
            const relations: FindOptionsRelations<Like> = { gallery: true };
            const select: FindOptionsSelect<Like> = { id: true };
            jest.spyOn(service, "findOne").mockResolvedValueOnce(mockLike as any);

            const result = await service.findOneById(id, relations, select);

            expect(service.findOne).toHaveBeenCalledWith({ id }, relations, select);
            expect(result).toEqual(mockLike);
        });
    });

    describe("findAll", () => {
        it("should find all likes by criteria", async () => {
            const where: FindOptionsWhere<Like> = { user_id: 1 };
            const relations: FindOptionsRelations<Like> = { gallery: true };
            const select: FindOptionsSelect<Like> = { id: true };
            const mockLikes = [mockLike, { ...mockLike, id: 2 }];
            jest.spyOn(likeRepository, "find").mockResolvedValueOnce(mockLikes as any);

            const result = await service.findAll(where, relations, select);

            expect(likeRepository.find).toHaveBeenCalledWith({
                where,
                relations,
                select,
                loadRelationIds: false,
                loadEagerRelations: false
            });
            expect(result).toEqual(mockLikes);
        });
    });

    describe("findForUser", () => {
        it("should find likes for a user", async () => {
            const userId = 1;
            const mockLikes = [mockLike];
            jest.spyOn(likeRepository, "find").mockResolvedValueOnce(mockLikes as any);

            const result = await service.findForUser(userId);

            expect(likeRepository.find).toHaveBeenCalledWith({
                where: { user_id: userId },
                relations: { gallery: true },
                select: { id: true, gallery: { id: true } },
                loadEagerRelations: false,
                loadRelationIds: false
            });
            expect(result).toEqual(mockLikes);
        });
    });

    describe("findForGallery", () => {
        it("should find likes for a gallery", async () => {
            const galleryId = 10;
            const mockLikes = [mockLike];
            jest.spyOn(likeRepository, "find").mockResolvedValueOnce(mockLikes as any);

            const result = await service.findForGallery(galleryId);

            expect(likeRepository.find).toHaveBeenCalledWith({
                where: { gallery_id: galleryId },
                relations: { user: true },
                select: { id: true, user: { id: true } },
                loadEagerRelations: false,
                loadRelationIds: false
            });
            expect(result).toEqual(mockLikes);
        });
    });

    describe("numberForUser", () => {
        it("should return the number of likes for a user", async () => {
            const userId = 1;
            const mockLikes = [{ id: 1 }, { id: 2 }]; // Two likes
            jest.spyOn(likeRepository, "find").mockResolvedValueOnce(mockLikes as any);

            const result = await service.numberForUser(userId);

            expect(likeRepository.find).toHaveBeenCalledWith({ where: { user_id: userId }, select: { id: true } });
            expect(result).toBe(2);
        });
    });

    describe("numberForGallery", () => {
        it("should return the number of likes for a gallery", async () => {
            const galleryId = 10;
            const mockLikes = [{ id: 1 }, { id: 2 }, { id: 3 }]; // Three likes
            jest.spyOn(likeRepository, "find").mockResolvedValueOnce(mockLikes as any);

            const result = await service.numberForGallery(galleryId);

            expect(likeRepository.find).toHaveBeenCalledWith({ where: { gallery_id: galleryId }, select: { id: true } });
            expect(result).toBe(3);
        });
    });


    describe("update", () => {
        it("should update a like", async () => {
            const likeId = 1;
            const updatedLike = { ...mockLike, gallery_id: 11 };
            jest.spyOn(likeRepository, "update").mockResolvedValue({} as any);
            jest.spyOn(likeRepository, "findOne").mockResolvedValue(updatedLike as any);

            const result = await service.update(likeId, { gallery_id: 11 });

            expect(likeRepository.update).toHaveBeenCalledWith(likeId, { gallery_id: 11 });
            expect(likeRepository.findOne).toHaveBeenCalledWith({ where: { id: likeId }, loadEagerRelations: false, loadRelationIds: false, relations: {}, select: {} });
            expect(result).toEqual(updatedLike);
        });
    });


    describe("delete", () => {
        it("should delete a like by ID", async () => {
            const likeId = 1;
            const deleteResult = { affected: 1, raw: [] };
            jest.spyOn(likeRepository, "delete").mockResolvedValueOnce(deleteResult as any);

            const result = await service.delete(likeId);

            expect(likeRepository.delete).toHaveBeenCalledWith(likeId);
            expect(result).toEqual(deleteResult);
        });
    });
});
