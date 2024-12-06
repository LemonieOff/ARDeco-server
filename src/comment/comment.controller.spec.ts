import { Test, TestingModule } from "@nestjs/testing";
import { CommentController } from "./comment.controller";
import { CommentService } from "./comment.service";
import { Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { GalleryService } from "../gallery/gallery.service";
import { BlockedUsersService } from "../blocked_users/blocked_users.service";
import { Gallery } from "../gallery/models/gallery.entity";
import { User } from "../user/models/user.entity";
import { Comment } from "./models/comment.entity";

describe("CommentController", () => {
    let commentController: CommentController;
    let commentService: CommentService;
    let jwtService: JwtService;
    let userService: UserService;
    let galleryService: GalleryService;
    let blockedUsersService: BlockedUsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CommentController],
            providers: [
                {
                    provide: CommentService,
                    useValue: {
                        allForGallery: jest.fn(),
                        create: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn()
                    }
                },
                {
                    provide: JwtService,
                    useValue: {
                        verify: jest.fn()
                    }
                },
                {
                    provide: UserService,
                    useValue: {
                        findOne: jest.fn()
                    }
                },
                {
                    provide: GalleryService,
                    useValue: {
                        findOne: jest.fn()
                    }
                },
                {
                    provide: BlockedUsersService,
                    useValue: {
                        findByBlocker: jest.fn(),
                        findByBlocked: jest.fn()
                    }
                }
            ]
        }).compile();

        commentController = module.get<CommentController>(CommentController);
        commentService = module.get<CommentService>(CommentService);
        jwtService = module.get<JwtService>(JwtService);
        userService = module.get<UserService>(UserService);
        galleryService = module.get<GalleryService>(GalleryService);
        blockedUsersService = module.get<BlockedUsersService>(BlockedUsersService);
    });

    describe("all", () => {
        it("should return a list of comments for a gallery", async () => {
            const req = { cookies: { jwt: "valid-jwt-token" } } as unknown as Request;
            const res = {
                status: jest.fn().mockReturnThis()
            } as unknown as Response;
            const galleryId = 1;
            jest.spyOn(commentService, "allForGallery").mockResolvedValue([
                { comment: "Test comment", user_id: 1 } as Comment
            ]);
            jest.spyOn(commentController, "checkAuthorization").mockResolvedValue([new User(), new Gallery()]);

            const result = await commentController.all(req, res, galleryId);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                code: 200,
                data: [{ comment: "Test comment", user_id: 1 }],
                description: `All comments for gallery ${galleryId}`,
                status: "OK"
            });
        });

        it("should return 400 if gallery ID is invalid or missing", async () => {
            const req = {} as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
            } as unknown as Response;

            const galleryId = NaN;

            const result = await commentController.all(req, res, galleryId);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                code: 400,
                data: null,
                description: "Gallery ID is required and must be a number",
                status: "KO"
            });
        });

        it("should return 401 if user is not authorized", async () => {
            const req = { cookies: { jwt: "invalid-jwt-token" } } as unknown as Request;
            const res = {
                status: jest.fn().mockReturnThis()
            } as unknown as Response;
            const galleryId = 1;

            jest.spyOn(commentController, "checkAuthorization").mockResolvedValue({
                code: 401,
                description: "You are not connected",
                status: "KO",
                data: null
            });

            const result = await commentController.all(req, res, galleryId);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                code: 401,
                data: null,
                description: "You are not connected",
                status: "KO"
            });
        });
    });

    describe("create", () => {
        it("should create a comment successfully", async () => {
            const req = {} as Request;
            const res = {
                status: jest.fn().mockReturnThis()
            } as unknown as Response;
            const galleryId = 1;
            const comment = "New comment";
            jest.spyOn(commentService, "create").mockResolvedValue({
                comment: "New comment",
                user_id: 1,
                id: 1,
                gallery: new Gallery(),
                gallery_id: 1,
                user: new User(),
                creation_date: new Date(),
                edited: false,
                edit_date: new Date()
            });


            const result = await commentController.create(
                req,
                res,
                galleryId,
                comment
            );

            expect(res.status).toHaveBeenCalledWith(201);
            expect(result).toEqual({
                code: 201,
                data: {
                    comment: "New comment",
                    user_id: 1
                },
                description: `Comment created successfully for gallery ${galleryId}`,
                status: "OK"
            });
        });
    });

    describe("update", () => {
        it("should update a comment successfully", async () => {
            const req = {} as Request;
            const res = {
                status: jest.fn().mockReturnThis()
            } as unknown as Response;
            const galleryId = 1;
            const commentId = 1;
            const comment = "Updated comment";
            jest.spyOn(commentService, "findOne").mockResolvedValue({
                id: commentId,
                comment: "Old comment",
                user_id: 1,
                gallery: new Gallery(),
                gallery_id: 1,
                user: new User(),
                creation_date: new Date(),
                edited: false,
                edit_date: new Date()
            });

            jest.spyOn(commentService, "update").mockResolvedValue({
                comment: "Updated comment",
                user_id: 1
            });

            const result = await commentController.update(
                req,
                res,
                galleryId,
                commentId,
                comment
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                code: 200,
                data: {
                    comment: "Updated comment",
                    user_id: 1
                },
                description: `Comment ${commentId} updated successfully`,
                status: "OK"
            });
        });
    });

    describe("delete", () => {
        it("should delete a comment successfully", async () => {
            const req = {} as Request;
            const res = {
                status: jest.fn().mockReturnThis()
            } as unknown as Response;
            const galleryId = 1;
            const commentId = 1;
            jest.spyOn(commentService, "findOne").mockResolvedValue({
                id: commentId,
                comment: "Old comment",
                user_id: 1
            } as Comment);
            jest.spyOn(commentService, "delete").mockResolvedValue({
                affected: 1
            } as any);

            const result = await commentController.delete(
                req,
                res,
                galleryId,
                commentId
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                code: 200,
                data: {
                    id: commentId,
                    comment: "Old comment",
                    user_id: 1
                },
                description: `Comment ${commentId} deleted successfully`,
                status: "OK"
            });
        });
    });
});
