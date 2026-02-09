import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Comment } from "./models/comment.entity";
import { CommentService } from "./comment.service";
import { User } from "../user/models/user.entity";
import { Gallery } from "../gallery/models/gallery.entity";
import { UserSettings } from "../user_settings/models/user_settings.entity";

describe("CommentService", () => {
    let service: CommentService;
    let commentRepository: Repository<Comment>;

    const mockUser: User = {
        id: 1,
        first_name: "Test",
        last_name: "User",
        settings: { display_lastname_on_public: false } as UserSettings,
        email: "",
        password: "",
        role: "client",
        company_api_key: null,
        galleries: [], galleryLikes: [], galleryComments: [], galleryReports: [],
        feedbacks: [], blocking: [], blocked_by: [], favorite_galleries: [],
        favorite_furniture: [], profile_picture_id: 0, checkEmailToken: null,
        checkEmailSent: null, hasCheckedEmail: false, deleted: false, city: null,
        phone: null, cart: null, googleId: null
    };

    const mockGallery = new Gallery();
    mockGallery.id = 10;

    const mockComment: Comment = {
        id: 1,
        comment: "Test comment",
        creation_date: new Date(),
        edited: false,
        edit_date: null,
        gallery: mockGallery,
        gallery_id: mockGallery.id,
        user: mockUser,
        user_id: mockUser.id
    };

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
            const expectedComments: Comment[] = [mockComment, { ...mockComment, id: 2 }];
            jest.spyOn(commentRepository, "find").mockResolvedValueOnce(expectedComments as any);

            const result = await service.all();

            expect(commentRepository.find).toHaveBeenCalled();
            expect(result).toEqual(expectedComments);
        });
    });

    describe("findOne", () => {
        it("should return one comment by id", async () => {
            jest.spyOn(commentRepository, "findOne").mockResolvedValueOnce(mockComment as any);

            const result = await service.findOne(1);

            expect(commentRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(result).toEqual(mockComment);
        });
    });

    describe("allForGallery", () => {
        it("should return all comments for a gallery", async () => {
            const galleryId = 10;
            const requestingUser = { ...mockUser, settings: { display_lastname_on_public: true } };
            const expectedComments = [
                { ...mockComment, user: { ...mockUser, settings: { display_lastname_on_public: true } } },
                { ...mockComment, id: 2, user: { ...mockUser, id: 2, settings: { display_lastname_on_public: true } } }
            ];

            jest.spyOn(commentRepository, "find").mockResolvedValue(expectedComments as any);

            const result = await service.allForGallery(galleryId, requestingUser as any);

            expect(commentRepository.find).toHaveBeenCalledWith({
                select: {
                    user: {
                        first_name: true,
                        last_name: true,
                        profile_picture_id: true
                    }
                },
                relations: { user: true },
                where: { gallery: { id: galleryId } }
            });

            const expectedResultComments = expectedComments.map(comment => ({
                ...comment,
                gallery: undefined,
                user: {
                    first_name: comment.user.first_name,
                    last_name: comment.user.last_name,
                    profile_picture_id: comment.user.profile_picture_id
                } as User
            }));

            expect(result).toEqual(expectedResultComments);
        });

        it("should return comments with last name displayed if author is self even if it should be hidden", async () => {
            const galleryId = 10;
            const requestingUser = { ...mockUser, settings: { display_lastname_on_public: false } };
            const expectedComments = [
                { ...mockComment, user: { ...mockUser, settings: { display_lastname_on_public: false } } },
                { ...mockComment, id: 2, user: { ...mockUser, id: 2, settings: { display_lastname_on_public: false } } }
            ];

            jest.spyOn(commentRepository, "find").mockResolvedValue(expectedComments as any);

            const result = await service.allForGallery(galleryId, requestingUser as any);

            const expectedResultComments = expectedComments.map(comment => ({
                ...comment,
                user: {
                    first_name: comment.user.first_name,
                    last_name: "User",
                    profile_picture_id: comment.user.profile_picture_id
                } as User
            }));

            expect(result).toEqual(expectedResultComments);
        });

        it("should return comments with last name displayed if requesting user is admin", async () => {
            const galleryId = 10;
            const requestingUser = { ...mockUser, role: "admin", settings: { display_lastname_on_public: false } };
            const expectedComments = [
                { ...mockComment, user: { ...mockUser, settings: { display_lastname_on_public: false } } },
                { ...mockComment, id: 2, user: { ...mockUser, id: 2, settings: { display_lastname_on_public: false } } }
            ];

            jest.spyOn(commentRepository, "find").mockResolvedValue(expectedComments as any);

            const result = await service.allForGallery(galleryId, requestingUser as any);

            const expectedResultComments = expectedComments.map(comment => ({
                ...comment,
                gallery: undefined,
                user: {
                    first_name: comment.user.first_name,
                    last_name: comment.user.last_name, // Last name should be displayed
                    profile_picture_id: comment.user.profile_picture_id
                } as User
            }));

            expect(result).toEqual(expectedResultComments);
        });

        it("should return comments with last name displayed if requesting user is the author", async () => {
            const galleryId = 10;
            const requestingUser = { ...mockUser, id: mockComment.user_id, settings: { display_lastname_on_public: false } };
            const expectedComments = [
                { ...mockComment, user: { ...mockUser, settings: { display_lastname_on_public: false } } }
            ];

            jest.spyOn(commentRepository, "find").mockResolvedValue(expectedComments as any);

            const result = await service.allForGallery(galleryId, requestingUser as any);

            const expectedResultComments = expectedComments.map(comment => ({
                ...comment,
                gallery: undefined,
                user: {
                    first_name: comment.user.first_name,
                    last_name: comment.user.last_name, // Last name should be displayed
                    profile_picture_id: comment.user.profile_picture_id
                } as User
            }));

            expect(result).toEqual(expectedResultComments);
        });
    });

    describe("create", () => {
        it("should create a new comment", async () => {
            const data = { comment: "New comment", gallery: mockGallery, user: mockUser };
            const newComment = {
                ...mockComment,
                comment: data.comment,
                gallery: data.gallery,
                user: data.user
            };
            jest.spyOn(commentRepository, "save").mockResolvedValue(newComment as any);
            const consoleSpy = jest.spyOn(console, "log");

            const result = await service.create(data as any);

            expect(commentRepository.save).toHaveBeenCalledWith(data);
            // expect(consoleSpy).toHaveBeenCalledWith("Create comment :", newComment);
            expect(result).toEqual({
                id: newComment.id,
                comment: newComment.comment,
                gallery_id: newComment.gallery_id,
                user_id: newComment.user_id,
                creation_date: newComment.creation_date
            });
        });
    });

    describe("update", () => {
        it("should update an existing comment", async () => {
            const updatedComment = { ...mockComment, comment: "Updated comment", edited: true };
            jest.spyOn(commentRepository, "save").mockResolvedValue(updatedComment as any);
            const consoleSpy = jest.spyOn(console, "log");

            const result = await service.update(updatedComment);

            expect(commentRepository.save).toHaveBeenCalledWith(updatedComment);
            // expect(consoleSpy).toHaveBeenCalledWith("Update comment :", updatedComment);
            expect(result).toEqual({
                id: updatedComment.id,
                comment: updatedComment.comment,
                gallery_id: updatedComment.gallery_id,
                user_id: updatedComment.user_id,
                creation_date: updatedComment.creation_date,
                edited: updatedComment.edited,
                edit_date: updatedComment.edit_date
            });
        });
    });

    describe("delete", () => {
        it("should delete a comment by id", async () => {
            const commentId = 1;
            const deleteResult = { raw: [], affected: 1 };
            jest.spyOn(commentRepository, "delete").mockResolvedValue(deleteResult as any);
            const consoleSpy = jest.spyOn(console, "log");

            const result = await service.delete(commentId);

            expect(commentRepository.delete).toHaveBeenCalledWith(commentId);
            // expect(consoleSpy).toHaveBeenCalledWith("Deleting comment ", commentId);
            expect(result).toEqual(deleteResult);
        });
    });
});
