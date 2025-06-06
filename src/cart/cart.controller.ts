/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, HttpStatus, Param, ParseArrayPipe, Post, Req, Res } from "@nestjs/common";
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
                description: "Items have successfully been added to cart",
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
            let cart: CartResponseDto | null;
            if (user.cart) {
                cart = await this.cartService.getCart(user.cart.id);
            } else {
                cart = null;
            }

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
                description: "Internal server error has occurred while trying to retrieve the cart",
                data: error
            };
        }
    }

    @Delete()
    async emptyCart(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.checkAuthorization(req, res);
        if (!(user instanceof User)) return user;

        try {
            if (user.cart) await this.cartService.delete(user.cart.id);

            res.status(HttpStatus.OK);
            return {
                status: "OK",
                code: HttpStatus.OK,
                description: "Cart has successfully been emptied",
                data: null
            };
        } catch (error) {
            console.log(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            return {
                status: "KO",
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                description: "Internal server error has occurred while trying to empty the cart",
                data: error
            };
        }
    }

    @Delete(":color_id")
    async removeItem(
        @Req() req: Request,
        @Param("color_id") color_id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        color_id = Number(color_id);
        if (!color_id || isNaN(color_id)) {
            res.status(HttpStatus.BAD_REQUEST);
            return {
                status: "KO",
                code: HttpStatus.BAD_REQUEST,
                description: "The color_id parameter must be a number",
                data: null
            };
        }

        const user = await this.checkAuthorization(req, res);
        if (!(user instanceof User)) return user;

        try {
            let cart: CartResponseDto | null;
            if (user.cart) {
                cart = await this.cartService.removeItem(user.cart, color_id);
            } else {
                cart = null;
            }

            res.status(HttpStatus.OK);
            return {
                status: "OK",
                code: HttpStatus.OK,
                description: "Item has successfully been removed from cart",
                data: cart
            };
        } catch (error) {
            console.log(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            return {
                status: "KO",
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                description: "Internal server error has occurred while trying to empty the cart",
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
