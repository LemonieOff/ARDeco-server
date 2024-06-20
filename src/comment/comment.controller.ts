import { Body, Controller, Delete, Get, Param, Post, Req, Res } from "@nestjs/common";
import { CommentService } from "./comment.service";
import { Request, Response } from "express";
import { Comment } from "./models/comment.entity";
import { User } from "../user/models/user.entity";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { GalleryService } from "../gallery/gallery.service";
import { Gallery } from "../gallery/models/gallery.entity";
import { BlockedUsersService } from "../blocked_users/blocked_users.service";

@Controller("")
export class CommentController {
    constructor(
        private commentService: CommentService,
        private jwtService: JwtService,
        private userService: UserService,
        private galleryService: GalleryService,
        private blockedUsersService: BlockedUsersService
    ) {
    }

    @Get("gallery/:gallery_id/comments")
    async all(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Param("gallery_id") gallery_id: number
    ): Promise<{
        status: string
        code: number;
        description: string;
        data: null | Partial<Comment>[];
    }> {
        try {
            if (Number.isNaN(gallery_id)) {
                res.status(400);
                return {
                    code: 400,
                    data: null,
                    description: "Gallery ID is required and must be a number",
                    status: "KO"
                };
            }

            // Check authorization of access (user and gallery)
            const auth = await this.checkAuthorization(req, gallery_id);
            if (!Array.isArray(auth)) {
                res.status(auth.code);
                return auth;
            }
            const [user, gallery] = auth;

            // Users blocked by the current user
            const blockedUsers = await this.blockedUsersService.findByBlocker(user.id);
            const blockedUsersIds = blockedUsers.map(blockedUser => blockedUser.blocked_user_id);

            // Users blocking the current user
            const blockerUsers = await this.blockedUsersService.findByBlocked(user.id);
            const blockerUsersIds = blockerUsers.map(blockerUser => blockerUser.user_id);

            // Filter comments to remove unwanted comments (from blocked users and blocking users)
            const comments = await this.commentService.allForGallery(gallery.id);
            const filteredComments = comments.filter(comment => {
                return !blockedUsersIds.includes(comment.user_id) && !blockerUsersIds.includes(comment.user_id);
            });

            // Return filtered comments
            res.status(200);
            return {
                code: 200,
                data: filteredComments,
                description: `All comments for gallery ${gallery.id}`,
                status: "OK"
            };
        } catch (e) {
            res.status(501);
            return {
                code: 501,
                data: e,
                description: "Error fetching comments",
                status: "KO"
            };
        }
    }

    @Post("gallery/:gallery_id/comments")
    async create(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
        @Param("gallery_id") gallery_id: number,
        @Body("comment") comment: string
    ): Promise<{
        status: string
        code: number;
        description: string;
        data: null | Partial<Comment>;
    }> {
        try {
            // Check comment presence
            if (!comment) {
                response.status(400);
                return {
                    code: 400,
                    data: null,
                    description: "Comment is required",
                    status: "KO"
                };
            }

            // Check parameters format
            if (Number.isNaN(gallery_id)) {
                response.status(400);
                return {
                    code: 400,
                    data: null,
                    description: "Gallery ID is required and must be a number",
                    status: "KO"
                };
            }

            // Check authorization of access (user and gallery)
            const auth = await this.checkAuthorization(request, gallery_id);
            if (!Array.isArray(auth)) {
                response.status(auth.code);
                return auth;
            }
            const [user, gallery] = auth;

            // Make comment object
            const commentObject: Comment = new Comment();
            commentObject.comment = comment;
            commentObject.user = user;
            commentObject.gallery = gallery;

            // Create the comment and check if it has actually been created
            const commentCreated = await this.commentService.create(commentObject);
            if (!commentCreated) {
                response.status(501);
                return {
                    code: 501,
                    data: null,
                    description: "Error creating comment",
                    status: "KO"
                };
            }

            response.status(201);
            return {
                code: 201,
                data: commentCreated,
                description: `Comment created successfully for gallery ${gallery_id}`,
                status: "OK"
            };
        } catch (e) {
            response.status(501);
            return {
                code: 501,
                data: e,
                description: "Error creating comment",
                status: "KO"
            };
        }
    }

    @Delete("gallery/:gallery_id/comments/:comment_id")
    async delete(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
        @Param("gallery_id") gallery_id: number,
        @Param("comment_id") comment_id: number
    ): Promise<{
        status: string
        code: number;
        description: string;
        data: null | Comment;
    }> {
        try {
            // Check parameters format
            if (Number.isNaN(gallery_id) || Number.isNaN(comment_id)) {
                response.status(400);
                return {
                    code: 400,
                    data: null,
                    description: "Gallery ID and Comment ID are required and must be numbers",
                    status: "KO"
                };
            }

            // Check authorization of access (user and gallery)
            const auth = await this.checkAuthorization(request, gallery_id);
            if (!Array.isArray(auth)) {
                response.status(auth.code);
                return auth;
            }
            const [user, gallery] = auth;

            // Find comment
            const comment = await this.commentService.findOne(comment_id);
            if (!comment) {
                response.status(404);
                return {
                    code: 404,
                    data: null,
                    description: "Comment not found",
                    status: "KO"
                };
            }

            // Check if user is the author of the comment
            if (comment.user_id !== user.id) {
                response.status(403);
                return {
                    code: 403,
                    data: null,
                    description: "You are not allowed to delete this comment",
                    status: "KO"
                };
            }

            // Check if comment belongs to gallery
            if (comment.gallery_id !== gallery.id) {
                response.status(403);
                return {
                    code: 403,
                    data: null,
                    description: `This comment does not belong to gallery ${gallery_id}`,
                    status: "KO"
                };
            }

            // Check if comment has actually been deleted
            const deletedResult = await this.commentService.delete(comment_id);
            console.log(deletedResult);
            if (deletedResult.affected !== 1) {
                response.status(501);
                return {
                    code: 501,
                    data: null,
                    description: "Error deleting comment",
                    status: "KO"
                };
            }

            // Return deleted comment and response
            response.status(200);
            return {
                code: 200,
                data: comment,
                description: `Comment ${comment_id} deleted successfully`,
                status: "OK"
            };
        } catch (e) {
            console.error(e);
            response.status(501);
            return {
                code: 501,
                data: e,
                description: "Error deleting comment",
                status: "KO"
            };
        }
    }

    async checkAuthorization(
        req: Request,
        gallery_id: number
    ): Promise<{
        code: number;
        data: null;
        description: string;
        status: string
    } | [User, Gallery]> {
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;

        // Cookie or JWT not valid
        if (!cookie || !data) {
            return {
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            };
        }

        // User retrieving
        const user = await this.userService.findOne({ id: data["id"] });

        // User not found
        if (!user) {
            return {
                status: "KO",
                code: 403,
                description:
                    "You are not allowed to access/modify this resource",
                data: null
            };
        }

        // Gallery retrieving
        const gallery = await this.galleryService.findOne({ id: gallery_id });

        // Gallery not found
        if (!gallery) {
            return {
                status: "KO",
                code: 404,
                description: "Gallery not found",
                data: null
            };
        }

        // Private gallery
        if (!gallery.visibility) {
            return {
                status: "KO",
                code: 403,
                description: "Gallery is private, so comments are currently frozen",
                data: null
            };
        }

        return [user, gallery];
    }
}
