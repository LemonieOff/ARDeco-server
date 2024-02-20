import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    Res
} from "@nestjs/common";
import { OrderHistoryService } from "./order_history_service";
import { Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { OrderHistory } from "./models/order_history.entity";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { User } from "../user/models/user.entity";
import { UserService } from "../user/user.service";

enum GetMode {
    DEFAULT,
    ID,
    DETAILS
}

enum Type {
    GET_ALL,
    GET_USER,
    GET_ORDER,
    POST
}

type QueryMode = {
    mode: string | [string];
};

@Controller(["order", "order_history"])
export class OrderHistoryController {
    constructor(
        private orderHistoryService: OrderHistoryService,
        private jwtService: JwtService,
        private userService: UserService
    ) {}

    /*@Get(":id")
    async get(
        @Req() req: Request,
        @Param("id") id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        const item = await this.orderHistoryService.findOne({ id: id });

        const authorizedUser = await this.checkAuthorization(req, res, item);
        if (!(authorizedUser instanceof User)) return authorizedUser;

        res.status(200);
        return {
            status: "OK",
            code: 200,
            description: "Order history item",
            data: item
        };
    }*/

    @Post()
    async post(
        @Req() req: Request,
        @Body() item: QueryPartialEntity<OrderHistory>,
        @Res({ passthrough: true }) res: Response
    ) {
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;

        // Cookie or JWT not valid
        if (!cookie || !data) {
            res.status(401);
            return {
                status: "KO",
                code: 401,
                description:
                    "You have to login in order to create an order history item",
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
                    "You are not allowed to create an order history item",
                data: null
            };
        }

        try {
            item.user_id = user.id;
            const result = await this.orderHistoryService.create(item);
            res.status(201);
            return {
                status: "OK",
                code: 201,
                description: "Order history item was created",
                data: result
            };
        } catch (e) {
            res.status(400);
            return {
                status: "KO",
                code: 400,
                description:
                    "Order history item was not created because of an error",
                error: e,
                data: null
            };
        }
    }

    /*async checkAuthorization(req: Request, res: Response, item: OrderHistory) {

        /!\ ONLY UNCOMMENT THIS PART WHEN NEEDED
        /!\ COMPLETELY CHECK THESE PERMISSIONS BEFORE UNCOMMENT AND ENABLE

        if (!item) {
            res.status(404);
            return {
                status: "KO",
                code: 404,
                description: "Resource was not found",
                data: null
            };
        }

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

        // Check if user is the creator
        if (item.user_id !== user.id) {
            // If not, check if it's an admin
            if (user.role !== "admin") {
                res.status(403);
                return {
                    status: "KO",
                    code: 403,
                    description:
                        "You are not allowed to modify/delete this resource",
                    data: null
                };
            }
        }

        return user;
    }*/
}
