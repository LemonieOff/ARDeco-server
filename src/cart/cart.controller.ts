/* eslint-disable prettier/prettier */
import { Body, Controller, Get, HttpStatus, ParseArrayPipe, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { CatalogService } from "src/catalog/catalog.service";
import { AddItemToCartDTO } from "./dtos/addToCart.dto";
import { CartService } from "./cart.service";
import { CartResponseDto } from "./dtos/CartResponse.dto";
import { User } from "../user/models/user.entity";

@Controller("cart")
export class CartController {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private catalogService: CatalogService,
        private cartService: CartService
    ) {
    }

    @Post(["", "/addItem"])
    async addItems(
        @Body(new ParseArrayPipe({ items: AddItemToCartDTO })) items: AddItemToCartDTO[],
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.checkAuthorization(req, res);
        if (!(user instanceof User)) return user;

        try {
            // Check existence for all items
            const colorItems: number[] = [];
            const ignoredItems: AddItemToCartDTO[] = [];
            for (const item of items) {
                const catalog = await this.catalogService.findColor(item.furniture_id, item.model_id);

                if (catalog) {
                    colorItems.push(catalog.id);
                } else {
                    ignoredItems.push(item);
                }
            }

            if (ignoredItems.length > 0) {
                console.debug(`Ignored items :`, ignoredItems);
            }

            let cart: CartResponseDto;
            if (!user.cart) {
                cart = await this.cartService.create(user.id, colorItems);
            } else {
                cart = await this.cartService.addItems(user.cart, colorItems);
            }

            res.status(HttpStatus.CREATED);
            return {
                status: "OK",
                code: HttpStatus.CREATED,
                description: "Items added to cart",
                data: cart
            };
        } catch (error) {
            console.log(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            return {
                status: "KO",
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                description: "Internal server error has occurred while trying to add items to the cart",
                data: error
            };
        }
    }

    @Get()
    async getCart(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.checkAuthorization(req, res);
        if (!(user instanceof User)) return user;

        try {
            let cart: CartResponseDto = await this.cartService.getCart(user.cart.id);

            res.status(HttpStatus.OK);
            return {
                status: "OK",
                code: HttpStatus.OK,
                description: "Cart items",
                data: cart
            };
        } catch (error) {
            console.log(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            return {
                status: "KO",
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                description: "Internal server error has occurred while trying to add items to the cart",
                data: error
            };
        }
    }

    async checkAuthorization(req: Request, res: Response) {
        // Check for connection
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;

        if (!data) {
            res.status(HttpStatus.UNAUTHORIZED);
            return {
                status: "KO",
                code: HttpStatus.UNAUTHORIZED,
                description: "You are not logged in",
                data: null
            };
        }

        // Check for user
        const usr = await this.userService.findOne({ id: data["id"] }, {
            id: true,
            role: true,
            cart: {
                id: true,
                items: true
            }
        }, {
            cart: {
                items: true
            }
        });

        if (!usr) {
            res.status(HttpStatus.FORBIDDEN);
            return {
                status: "KO",
                code: HttpStatus.FORBIDDEN,
                description: "This user doesn't exist",
                data: null
            };
        }

        return usr;
    }
}
