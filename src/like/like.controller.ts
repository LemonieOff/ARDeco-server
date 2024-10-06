import { Controller, Delete, Get, HttpStatus, Param, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { User } from "../user/models/user.entity";
import { UserService } from "../user/user.service";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { LikeService } from "./like.service";
import { GalleryService } from "../gallery/gallery.service";
import { BlockedUsersService } from "../blocked_users/blocked_users.service";
import { Like } from "./models/like.entity";

@Controller("likes")
export class LikeController {
    constructor(
        private likeService: LikeService,
        private galleryService: GalleryService,
        private jwtService: JwtService,
        private userService: UserService,
        private blockedUsersService: BlockedUsersService
    ) {
    }

    // Get all likes
    @Get()
    async all(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const fetcher = await this.checkLogin(req, res);
        if (!(fetcher instanceof User)) return fetcher;

        // Default relations and selected relations' items
        const [relations, select] = this.getSelect();

        const items = await this.likeService.findAll({}, relations, select);

        res.status(HttpStatus.OK);
        return {
            status: "OK",
            code: HttpStatus.OK,
            description: "All likes",
            data: items
        };
    }

    // All likes for a specific gallery (count by default, but details mode is possible)
    @Get("/gallery/:id")
    async getLikesForGallery(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Param("id") id: number) {
        return this.getLikes(req, res, "gallery", id);
    }

    // All likes for a specific user (same behavior as for galleries)
    @Get("/user/:id")
    async getLikesForUser(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Param("id") id: number) {
        return this.getLikes(req, res, "user", id);
    }

    @Get("/user/:user_id/gallery/:gallery_id")
    async isUserLikingGallery(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Param("user_id") user_id: number,
        @Param("gallery_id") gallery_id: number) {
        // TODO : Check login
        const isLiked = await this.likeService.isLiked(user_id, gallery_id);
        res.status(HttpStatus.OK);
        return {
            status: "OK",
            code: HttpStatus.OK,
            description: `User ${user_id} is${isLiked ? " " : " not "}liking gallery ${gallery_id}`,
            data: isLiked
        };
    }

    // TODO : Details mode
    async getLikes(req: Request, res: Response, mode: "user" | "gallery", id: number) {
        const fetcher = await this.checkLogin(req, res, mode, id);
        if (!(fetcher instanceof User)) return fetcher;

        let likes: number = 0;

        if (mode === "user") likes = await this.likeService.numberForUser(id);
        else if (mode === "gallery") likes = await this.likeService.numberForGallery(id);

        res.status(HttpStatus.OK);
        return {
            status: "OK",
            code: HttpStatus.OK,
            description: `Likes for ${mode} ${id}`,
            data: likes
        };
    }

    // Like a creation
    @Post("/gallery/:id")
    async like(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Param("id") id: number) {
        const fetcher = await this.checkLogin(req, res, "gallery", id);
        if (!(fetcher instanceof User)) return fetcher;

        // Check if gallery is already liked by user
        const isLiked = await this.likeService.isLiked(fetcher.id, id);

        if (isLiked) {
            res.status(HttpStatus.CONFLICT);
            return {
                status: "KO",
                code: HttpStatus.CONFLICT,
                description: "You already likes this gallery",
                data: null
            };
        }

        await this.likeService.like(fetcher.id, id);
        res.status(HttpStatus.CREATED);
        return {
            status: "OK",
            code: HttpStatus.CREATED,
            description: "You successfully liked this gallery",
            data: null
        };
    }

    // Like a creation
    @Delete("/gallery/:id")
    async unlike(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Param("id") id: number) {
        const fetcher = await this.checkLogin(req, res, "gallery", id);
        if (!(fetcher instanceof User)) return fetcher;

        // Check if gallery is already liked by user
        const isLiked = await this.likeService.isLiked(fetcher.id, id);

        if (!isLiked) {
            res.status(HttpStatus.CONFLICT);
            return {
                status: "KO",
                code: HttpStatus.CONFLICT,
                description: "You cannot unlike a gallery you don't currently like",
                data: null
            };
        }

        await this.likeService.unlike(fetcher.id, id);
        res.status(HttpStatus.CREATED);
        return {
            status: "OK",
            code: HttpStatus.CREATED,
            description: "You successfully unliked this gallery",
            data: null
        };
    }

    async checkLogin(req: Request, res: Response, mode: "gallery" | "user" | "all" = "all", id: number = null): Promise<{
        code: number;
        data: any;
        description: string;
        status: "OK" | "KO"
    } | User> {
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;

        // Cookie or JWT not valid
        if (!cookie || !data) {
            res.status(HttpStatus.UNAUTHORIZED);
            return {
                status: "KO",
                code: HttpStatus.UNAUTHORIZED,
                description: "You are not connected",
                data: null
            };
        }

        // Requesting user
        const user = await this.userService.findOne({ id: data["id"] });

        if (!user) {
            res.status(HttpStatus.FORBIDDEN);
            return {
                status: "KO",
                code: HttpStatus.FORBIDDEN,
                description:
                    "You are not allowed to access this resource",
                data: null
            };
        }

        if (mode === "all") {
            if (user.role === "admin") return user;
            else {
                res.status(HttpStatus.FORBIDDEN);
                return {
                    status: "KO",
                    code: HttpStatus.FORBIDDEN,
                    description: "You must me an admin to retrieve all likes",
                    data: null
                };
            }
        }

        if (!id) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            return {
                status: "KO",
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                description: "Server error : an id must be passed to check function",
                data: null
            };
        }
        id = Number(id);
        if (isNaN(id)) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            return {
                status: "KO",
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                description: "Provided id is not a number",
                data: id
            };
        }

        console.log("TEST");

        if (mode === "user") {
            console.log("TEST");
            console.log(user.id);
            console.log(id);
            if (user.id === id) return user; // User to fetch is actually the requesting user, ignoring useless user fetch and checks

            const userToFetch = await this.userService.findOne({ id: id });

            if (!userToFetch) {
                res.status(HttpStatus.NOT_FOUND);
                return {
                    status: "KO",
                    code: HttpStatus.NOT_FOUND,
                    description: "This user is not found",
                    data: null
                };
            }

            if (user.role === "admin") return user; // Requesting user is an admin so it has all rights

            // If not admin nor same user, forbidden access to other users' likes
            res.status(HttpStatus.FORBIDDEN);
            return {
                status: "KO",
                code: HttpStatus.FORBIDDEN,
                description: "You are not allowed to access this user's likes",
                data: null
            };

            /* Blocked users system if someday other users will be able to access like count of other users

            const isFetcherBlocking = await this.blockedUsersService.checkBlockedForBlocker(user.id, userToFetch.id);
            if (isFetcherBlocking) {
                res.status(HttpStatus.FORBIDDEN);
                return {
                    status: "KO",
                    code: HttpStatus.FORBIDDEN,
                    description: "You cannot access this user's likes because you have blocked it.",
                    data: null
                };
            }

            const isFetcherBlocked = await this.blockedUsersService.checkBlockedForBlocker(userToFetch.id, user.id);
            if (isFetcherBlocked) {
                res.status(HttpStatus.FORBIDDEN);
                return {
                    status: "KO",
                    code: HttpStatus.FORBIDDEN,
                    // Same description as private items,
                    // to not reveal the fact of being blocked
                    description: "You are not allowed to access this user's likes",
                    data: null
                };
            }*/
        } else if (mode === "gallery") {
            const gallery = await this.galleryService.findOne({ id: id }, { user: true }, {
                id: true,
                visibility: true,
                user: { id: true }
            });

            if (!gallery) {
                res.status(HttpStatus.NOT_FOUND);
                return {
                    status: "KO",
                    code: HttpStatus.NOT_FOUND,
                    description: "Gallery was not found",
                    data: null
                };
            }

            // Admin can access everything (invisible items and blocked ones)
            if (user.role === "admin") return user;

            // Creator has all rights on its own galleries, private or not
            if (user.id === gallery.user.id) return user;

            // Check for item visibility, private ones are inaccessible
            if (!gallery.visibility) {
                res.status(HttpStatus.FORBIDDEN);
                return {
                    status: "KO",
                    code: HttpStatus.FORBIDDEN,
                    description: "You are not allowed to access this gallery's likes",
                    data: null
                };
            }

            const isFetcherBlocking = await this.blockedUsersService.checkBlockedForBlocker(user.id, gallery.user.id);
            if (isFetcherBlocking) {
                res.status(HttpStatus.FORBIDDEN);
                return {
                    status: "KO",
                    code: HttpStatus.FORBIDDEN,
                    description: "You cannot access this gallery's likes because you have blocked its creator.",
                    data: null
                };
            }

            const isFetcherBlocked = await this.blockedUsersService.checkBlockedForBlocker(gallery.user.id, user.id);
            if (isFetcherBlocked) {
                res.status(HttpStatus.FORBIDDEN);
                return {
                    status: "KO",
                    code: HttpStatus.FORBIDDEN,
                    // Same description as private items,
                    // to not reveal the fact of being blocked
                    description: "You are not allowed to access this gallery's likes",
                    data: null
                };
            }
        } else {
            res.status(HttpStatus.NOT_IMPLEMENTED);
            return {
                status: "KO",
                code: HttpStatus.NOT_IMPLEMENTED,
                description: "You are trying to access a resource in a way that has not yet been implemented",
                data: `mode: ${mode}`
            };
        }

        return user;
    }

    getSelect(): [FindOptionsRelations<Like>, FindOptionsSelect<Like>] {
        const relations: FindOptionsRelations<Like> = {
            gallery: true,
            user: true
        };

        const select: FindOptionsSelect<Like> = {
            id: true,
            user: {
                id: true,
                role: true
            },
            gallery: {
                id: true,
                visibility: true,
                user: {
                    id: true
                }
            }
        };

        // TODO : Use req.query["details"] (add req to function param) to fetch details from user/gallery if necessary

        return [relations, select];
    }
}
