import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Comment } from "./models/comment.entity";
import { CommentService } from "./comment.service";
import { Gallery } from "../gallery/models/gallery.entity";
import { User } from "../user/models/user.entity";

describe("CommentService", () => {
    let service: CommentService;
    let commentRepository: Repository<Comment>;

    const mockUser = new User();
    mockUser.id = 1;

    const mockGallery = new Gallery();
    mockGallery.id = 10;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentService,
                {
                    provide: getRepositoryToken(Comment),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        delete: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<CommentService>(CommentService);
        commentRepository = module.get<Repository<Comment>>(getRepositoryToken(Comment));
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("all", () => {
        it("should return all comments", async () => {
            const mockComments = [new Comment(), new Comment()];
            jest.spyOn(commentRepository, "find").mockResolvedValue(mockComments);
            const result = await service.all();
            expect(result).toEqual(mockComments);
        });
    });

    describe("findOne", () => {
        it("should return a comment by ID", async () => {
            const commentId = 1;
            const mockComment = new Comment();
            jest.spyOn(commentRepository, "findOne").mockResolvedValue(mockComment);
            const result = await service.findOne(commentId);
            expect(result).toEqual(mockComment);
            expect(commentRepository.findOne).toHaveBeenCalledWith({ where: { id: commentId } });
        });
    });

    describe("allForGallery", () => {
        it("should return all comments for a gallery", async () => {
            const galleryId = 10;

            const comment1 = new Comment();
            const comment2 = new Comment();
            Object.assign(comment1, {
                id: 1,
                comment: "Comment 1",
                gallery_id: mockGallery.id,
                user_id: mockUser.id,
                creation_date: new Date()
            });
            Object.assign(comment2, {
                id: 2,
                comment: "Comment 2",
                gallery_id: mockGallery.id,
                user_id: mockUser.id,
                creation_date: new Date()
            });

            const mockComments = [comment1, comment2];
            jest.spyOn(commentRepository, "find").mockResolvedValue(mockComments as any);
            const result = await service.allForGallery(galleryId, {} as any);
            expect(result).toEqual([
                {
                    id: 1,
                    comment: "Comment 1",
                    gallery_id: galleryId,
                    user_id: mockUser.id,
                    creation_date: mockComments[0].creation_date
                },
                {
                    id: 2,
                    comment: "Comment 2",
                    gallery_id: galleryId,
                    user_id: mockUser.id,
                    creation_date: mockComments[1].creation_date
                }
            ]);
            expect(commentRepository.find).toHaveBeenCalledWith({
                where: {
                    gallery: { id: galleryId }
                }
            });
        });
    });

    describe("create", () => {
        it("should create a new comment and return a partial comment", async () => {
            const data = { comment: "New Comment", gallery: mockGallery, user_id: mockUser.id };
            const newComment = new Comment();
            Object.assign(newComment, { id: 1, ...data, creation_date: new Date() });
            Object.defineProperty(newComment, "gallery_id", { value: mockGallery.id });
            jest.spyOn(commentRepository, "save").mockResolvedValue(newComment as any);
            const consoleSpy = jest.spyOn(console, "log"); // Spy on console.log
            const result = await service.create(data);
            expect(result).toEqual({
                id: 1,
                comment: "New Comment",
                gallery_id: mockGallery.id,
                user_id: mockUser.id,
                creation_date: newComment.creation_date
            });
            expect(consoleSpy).toHaveBeenCalledWith("Create comment :", newComment); // Check console.log call
        });
    });

    describe("delete", () => {
        it("should delete a comment by ID", async () => {
            const commentId = 1;
            const deleteResult = { raw: [], affected: 1 }; // Mock delete result
            jest.spyOn(commentRepository, "delete").mockResolvedValue(deleteResult as any);
            const consoleSpy = jest.spyOn(console, "log"); // Spy on console.log
            const result = await service.delete(commentId);
            expect(result).toEqual(deleteResult); // Check if delete result is returned
            expect(commentRepository.delete).toHaveBeenCalledWith(commentId);
            expect(consoleSpy).toHaveBeenCalledWith("Deleting comment ", commentId); // Check console.log call
        });
    });
});
