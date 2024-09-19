import { Test, TestingModule } from "@nestjs/testing";
import { CommentController } from "./comment.controller";
import { CommentService } from "./comment.service";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { GalleryService } from "../gallery/gallery.service";
import { BlockedUsersService } from "../blocked_users/blocked_users.service";
import { User } from "../user/models/user.entity";
import { Gallery } from "../gallery/models/gallery.entity";
import { Comment } from "./models/comment.entity";
import { Request, Response } from "express";
import { BlockedUser } from "../blocked_users/entities/blocked_user.entity";

describe("CommentController", () => {
    let controller: CommentController;
    let commentService: CommentService;
    let userService: UserService;
    let galleryService: GalleryService;
    let blockedUsersService: BlockedUsersService;

    const mockUser = new User();
    mockUser.id = 1;
    mockUser.role = "client";

    const mockGallery = new Gallery();
    mockGallery.id = 10;
    mockGallery.visibility = true;

    const mockRequest = {
        cookies: { jwt: "validJwtToken" }
    } as Request;
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as unknown as Response;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CommentController],
            providers: [
                {
                    provide: CommentService,
                    useValue: {
                        all: jest.fn(),
                        findOne: jest.fn(),
                        allForGallery: jest.fn(),
                        create: jest.fn(),
                        delete: jest.fn()
                    }
                },
                {
                    provide: JwtService,
                    useValue: {
                        verify: jest.fn().mockReturnValue({ id: 1 }),
                        verifyAsync: jest.fn().mockReturnValue({ id: 1 })
                    }
                },
                {
                    provide: UserService,
                    useValue: {
                        findOne: jest.fn().mockResolvedValue(mockUser)
                    }
                },
                {
                    provide: GalleryService,
                    useValue: {
                        findOne: jest.fn().mockResolvedValue(mockGallery)
                    }
                },
                {
                    provide: BlockedUsersService,
                    useValue: {
                        findByBlocker: jest.fn().mockResolvedValue([]), // No blocked users by default
                        findByBlocked: jest.fn().mockResolvedValue([])  // No blocking users by default
                    }
                }
            ]
        }).compile();

        controller = module.get<CommentController>(CommentController);
        commentService = module.get<CommentService>(CommentService);
        userService = module.get<UserService>(UserService);
        galleryService = module.get<GalleryService>(GalleryService);
        blockedUsersService = module.get<BlockedUsersService>(BlockedUsersService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("all", () => {
        it("should return 400 if gallery_id is not a number", async () => {
            const result = await controller.all(mockRequest, mockResponse, NaN);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                code: 400,
                data: null,
                description: "Gallery ID is required and must be a number",
                status: "KO"
            });
        });

        it("should return 401 if user is not connected", async () => {
            const request = { cookies: {} } as Request;
            const result = await controller.all(request, mockResponse, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.all(mockRequest, mockResponse, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 404 if gallery is not found", async () => {
            jest.spyOn(galleryService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.all(mockRequest, mockResponse, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Gallery not found",
                data: null
            });
        });

        it("should return 200 and all comments for a gallery", async () => {
            const mockComments: Comment[] = [
                {
                    id: 1, comment: "Comment 1", user_id: 1, creation_date: new Date(),
                    gallery: new Gallery,
                    gallery_id: 0,
                    user: new User
                },
                {
                    id: 2, comment: "Comment 2", user_id: 2, creation_date: new Date(),
                    gallery: new Gallery,
                    gallery_id: 0,
                    user: new User
                }
            ];
            jest.spyOn(commentService, "allForGallery").mockResolvedValue(mockComments);
            const result = await controller.all(mockRequest, mockResponse, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                code: 200,
                data: mockComments,
                description: "All comments for gallery 10",
                status: "OK"
            });
        });

        it("should filter comments from blocked users", async () => {
            const mockComments: Comment[] = [
                {
                    id: 1, comment: "Comment 1", user_id: 1, creation_date: new Date(),
                    gallery: new Gallery,
                    gallery_id: 0,
                    user: new User
                },
                {
                    id: 2, comment: "Comment 2", user_id: 2, creation_date: new Date(),
                    gallery: new Gallery,
                    gallery_id: 0,
                    user: new User
                },
                {
                    id: 3, comment: "Comment 3", user_id: 3, creation_date: new Date(),
                    gallery: new Gallery,
                    gallery_id: 0,
                    user: new User
                }
            ];
            const blockedUsers: BlockedUser[] = [{ blocked_user_id: 2 } as BlockedUser];
            jest.spyOn(commentService, "allForGallery").mockResolvedValue(mockComments);
            jest.spyOn(blockedUsersService, "findByBlocker").mockResolvedValue(blockedUsers);
            const result = await controller.all(mockRequest, mockResponse, 10);
            expect(result.data).toEqual(mockComments.filter(c => c.user_id !== 2));
        });

        it("should filter comments from blocking users", async () => {
            const mockComments: Comment[] = [
                {
                    id: 1, comment: "Comment 1", user_id: 1, creation_date: new Date(),
                    gallery: new Gallery,
                    gallery_id: 0,
                    user: new User
                },
                {
                    id: 2, comment: "Comment 2", user_id: 2, creation_date: new Date(),
                    gallery: new Gallery,
                    gallery_id: 0,
                    user: new User
                },
                {
                    id: 3, comment: "Comment 3", user_id: 3, creation_date: new Date(),
                    gallery: new Gallery,
                    gallery_id: 0,
                    user: new User
                }
            ];
            const blockerUsers: BlockedUser[] = [{ user_id: 3 } as BlockedUser];
            jest.spyOn(commentService, "allForGallery").mockResolvedValue(mockComments);
            jest.spyOn(blockedUsersService, "findByBlocked").mockResolvedValue(blockerUsers);
            const result = await controller.all(mockRequest, mockResponse, 10);
            expect(result.data).toEqual(mockComments.slice(0, 2));
        });

        it("should return 501 if there's an error while fetching comments", async () => {
            jest.spyOn(commentService, "allForGallery").mockRejectedValue(new Error("Database error"));
            const result = await controller.all(mockRequest, mockResponse, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                code: 501,
                data: expect.any(Error), // Expect an error object
                description: "Error fetching comments",
                status: "KO"
            });
        });
    });

    describe("create", () => {
        it("should return 400 if comment is missing", async () => {
            const result = await controller.create(mockRequest, mockResponse, 10, undefined);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                code: 400,
                data: null,
                description: "Comment is required",
                status: "KO"
            });
        });

        it("should return 400 if gallery_id is not a number", async () => {
            const result = await controller.create(mockRequest, mockResponse, NaN, "New comment");
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                code: 400,
                data: null,
                description: "Gallery ID is required and must be a number",
                status: "KO"
            });
        });

        it("should return 401 if user is not connected", async () => {
            const request = { cookies: {} } as Request;
            const result = await controller.create(request, mockResponse, 10, "New comment");
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.create(mockRequest, mockResponse, 10, "New comment");
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 404 if gallery is not found", async () => {
            jest.spyOn(galleryService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.create(mockRequest, mockResponse, 10, "New comment");
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Gallery not found",
                data: null
            });
        });

        it("should return 201 and the created comment", async () => {
            const newComment: Partial<Comment> = { id: 1, comment: "New comment", gallery_id: 10, user_id: 1 };
            jest.spyOn(commentService, "create").mockResolvedValue(newComment);
            const result = await controller.create(mockRequest, mockResponse, 10, "New comment");
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(result).toEqual({
                code: 201,
                data: newComment,
                description: "Comment created successfully for gallery 10",
                status: "OK"
            });
        });

        it("should return 501 if there's an error creating the comment", async () => {
            jest.spyOn(commentService, "create").mockResolvedValue(null);
            const result = await controller.create(mockRequest, mockResponse, 10, "New comment");
            expect(mockResponse.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                code: 501,
                data: null,
                description: "Error creating comment",
                status: "KO"
            });
        });
    });

    describe("delete", () => {
        it("should return 400 if gallery_id is not a number", async () => {
            const result = await controller.delete(mockRequest, mockResponse, NaN, 1);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                code: 400,
                data: null,
                description: "Gallery ID and Comment ID are required and must be numbers",
                status: "KO"
            });
        });

        it("should return 400 if comment_id is not a number", async () => {
            const result = await controller.delete(mockRequest, mockResponse, 10, NaN);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                code: 400,
                data: null,
                description: "Gallery ID and Comment ID are required and must be numbers",
                status: "KO"
            });
        });

        it("should return 401 if user is not connected", async () => {
            const request = { cookies: {} } as Request;
            const result = await controller.delete(request, mockResponse, 10, 1);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.delete(mockRequest, mockResponse, 10, 1);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 404 if gallery is not found", async () => {
            jest.spyOn(galleryService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.delete(mockRequest, mockResponse, 10, 1);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Gallery not found",
                data: null
            });
        });

        it("should return 404 if comment is not found", async () => {
            jest.spyOn(commentService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.delete(mockRequest, mockResponse, 10, 1);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                code: 404,
                data: null,
                description: "Comment not found",
                status: "KO"
            });
        });

        it("should return 403 if user is not the author of the comment", async () => {
            const mockComment = { id: 1, user_id: 2, gallery_id: 10 } as Comment;
            jest.spyOn(commentService, "findOne").mockResolvedValueOnce(mockComment);
            const result = await controller.delete(mockRequest, mockResponse, 10, 1);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                code: 403,
                data: null,
                description: "You are not allowed to delete this comment",
                status: "KO"
            });
        });

        it("should return 403 if comment does not belong to gallery", async () => {
            const mockComment = { id: 1, user_id: 1, gallery_id: 11 } as Comment;
            jest.spyOn(commentService, "findOne").mockResolvedValueOnce(mockComment);
            const result = await controller.delete(mockRequest, mockResponse, 10, 1);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                code: 403,
                data: null,
                description: "This comment does not belong to gallery 10",
                status: "KO"
            });
        });

        it("should return 200 and the deleted comment", async () => {
            const mockComment = { id: 1, user_id: 1, gallery_id: 10 } as Comment;
            jest.spyOn(commentService, "findOne").mockResolvedValueOnce(mockComment);
            jest.spyOn(commentService, "delete").mockResolvedValue({ affected: 1 } as any);
            const consoleSpy = jest.spyOn(console, "log");
            const result = await controller.delete(mockRequest, mockResponse, 10, 1);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(consoleSpy).toHaveBeenCalledWith({ affected: 1 });
            expect(result).toEqual({
                code: 200,
                data: mockComment,
                description: "Comment 1 deleted successfully",
                status: "OK"
            });
        });

        it("should return 501 if there's an error deleting the comment", async () => {
            const mockComment = { id: 1, user_id: 1, gallery_id: 10 } as Comment;
            const error = new Error("Delete comment database error test");
            jest.spyOn(commentService, "findOne").mockResolvedValueOnce(mockComment);
            jest.spyOn(commentService, "delete").mockImplementationOnce(() => { throw error });
            const consoleSpy = jest.spyOn(console, "error"); // Use console.error for error logging
            const result = await controller.delete(mockRequest, mockResponse, 10, 1);
            expect(mockResponse.status).toHaveBeenCalledWith(501);
            expect(consoleSpy).toHaveBeenCalledWith(error); // Check if console.error was called
            expect(result).toEqual({
                code: 501,
                data: error,
                description: "Error deleting comment",
                status: "KO"
            });
        });
    });

    describe("checkAuthorization", () => {
        it("should return 401 if user is not connected", async () => {
            const request = { cookies: {} } as Request;
            const result = await controller["checkAuthorization"](request, 10);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller["checkAuthorization"](mockRequest, 10);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 404 if gallery is not found", async () => {
            jest.spyOn(galleryService, "findOne").mockResolvedValueOnce(null);
            const result = await controller["checkAuthorization"](mockRequest, 10);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Gallery not found",
                data: null
            });
        });

        it("should return 403 if gallery is private", async () => {
            const mockPrivateGallery = { ...mockGallery, visibility: false };
            jest.spyOn(galleryService, "findOne").mockResolvedValueOnce(mockPrivateGallery);
            const result = await controller["checkAuthorization"](mockRequest, 10);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "Gallery is private, so comments are currently frozen",
                data: null
            });
        });

        it("should return user and gallery if authorized", async () => {
            const result = await controller["checkAuthorization"](mockRequest, 10);
            expect(result).toEqual([mockUser, mockGallery]);
        });
    });
});
