import { Controller, Delete, Get, Param, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { FavoriteFurniture } from "./models/favorite_furniture.entity";
import { FavoriteFurnitureService } from "./favorite_furniture.service";
import { JwtService } from "@nestjs/jwt";
import { User } from "../user/models/user.entity";
import { UserService } from "../user/user.service";
import { CatalogService } from "../catalog/catalog.service";
import { Catalog } from "src/catalog/models/catalog.entity";

@Controller("favorite/furniture")
export class FavoriteFurnitureController {
    constructor(
        private favFurnitureService: FavoriteFurnitureService,
        private jwtService: JwtService,
        private userService: UserService,
        private catalogService: CatalogService
    ) {
    }

    @Get()
    async all(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const user = await this.checkAuthorization(req, res);
        if (!(user instanceof User)) return user;

        const items = await this.favFurnitureService.findAll(user.id);

        let furnitureItems: any[] = [];

        for (const item of items) {
            const furniture: Catalog = await this.catalogService.findOne({
                id: item.furniture_id
            });
            if (!furniture) continue;
            furnitureItems.push({
                furniture: {
                    id: furniture.id,
                    name: furniture.name,
                    price: furniture.price,
                    styles: furniture.styles.map(style => style.style),
                    colors: furniture.colors.map(color => ({
                        color: color.color,
                        model_id: color.model_id
                    })),
                    rooms: furniture.rooms.map(room => room.room),
                    height: furniture.height,
                    width: furniture.width,
                    depth: furniture.depth,
                    company: furniture.company_name,
                    active: furniture.active
                },
                favorite_furniture: item
            });
        }

        try {
            if (items.length === 0) {
                res.status(404);
                return {
                    status: "KO",
                    code: 404,
                    description: "You don't have any favorite furniture items",
                    data: []
                };
            }

            res.status(200);
            return {
                status: "OK",
                code: 200,
                description: "Favorite furniture items",
                data: furnitureItems
            };
        } catch (e) {
            res.status(501);
            return {
                status: "KO",
                code: 501,
                description:
                    "Favorite furniture list was not display because of an error",
                error: e,
                data: null
            };
        }
    }

    @Post("/:furniture_id")
    async post(
        @Req() req: Request,
        @Param("furniture_id") furniture_id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.checkAuthorization(req, res);
        if (!(user instanceof User)) return user;

        const furniture = await this.catalogService.findOne({
            id: furniture_id
        });
        if (!furniture) {
            res.status(404);
            return {
                status: "KO",
                code: 404,
                description:
                    "You are not allowed to add this furniture to your favorites because it does not exist",
                data: null
            };
        }

        const existingItem = await this.favFurnitureService.findOne({
            furniture_id: furniture_id,
            user_id: user.id
        });
        if (existingItem) {
            res.status(409);
            return {
                status: "KO",
                code: 409,
                description:
                    "You already have this furniture in your favorites",
                data: null
            };
        }

        try {
            const favoriteFurniture = new FavoriteFurniture();
            favoriteFurniture.furniture_id = furniture_id;
            favoriteFurniture.user_id = user.id;
            const result = await this.favFurnitureService.create(
                favoriteFurniture
            );
            res.status(201);
            return {
                status: "OK",
                code: 201,
                description: "Furniture item was added to your favorites",
                data: result
            };
        } catch (e) {
            res.status(501);
            return {
                status: "KO",
                code: 501,
                description:
                    "Furniture item was not added to your favorites because of an error",
                error: e,
                data: null
            };
        }
    }

    @Delete("/:furniture_id")
    async deleteItem(
        @Req() req: Request,
        @Param("furniture_id") furniture_id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        const authorizedUser = await this.checkAuthorization(
            req,
            res,
            furniture_id,
            "delete"
        );
        if (!(authorizedUser instanceof User)) return authorizedUser;

        try {
            const furniture = await this.favFurnitureService.findOne({
                user_id: authorizedUser.id,
                furniture_id: furniture_id
            });

            await this.favFurnitureService.delete(furniture_id);
            res.status(200);
            return {
                status: "OK",
                code: 200,
                description:
                    "Furniture furniture was removed from your favorites",
                data: furniture
            };
        } catch (e) {
            res.status(500);
            return {
                status: "OK",
                code: 500,
                description: "Server error",
                data: e
            };
        }
    }

    async checkAuthorization(
        req: Request,
        res: Response,
        furniture_id: number | null = null,
        type: String | null = null
    ) {
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;

        // Cookie or JWT not valid
        if (!cookie || !data) {
            res.status(401);
            return {
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            };
        }

        const user = await this.userService.findOne({ id: data["id"] });

        if (!user) {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                description:
                    "You are not allowed to access/modify this resource",
                data: null
            };
        }

        if (type === "delete") {
            const furniture = await this.favFurnitureService.findOne({
                user_id: user.id,
                furniture_id: furniture_id
            });

            if (!furniture) {
                res.status(404);
                return {
                    status: "KO",
                    code: 404,
                    description:
                        "This furniture item is not in this user's favorites furniture list",
                    data: null
                };
            }

            if (furniture.user_id !== user.id) {
                if (user.role !== "admin") {
                    res.status(403);
                    return {
                        status: "KO",
                        code: 403,
                        description:
                            "You are not allowed to access/modify this resource",
                        data: null
                    };
                }
            }
        }
        return user;
    }
}
