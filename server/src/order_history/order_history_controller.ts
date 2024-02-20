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

    private selectGetMode = (mode: QueryMode): GetMode => {
        console.log(mode);
        if (!mode.mode) return GetMode.DEFAULT;
        if (typeof mode.mode === "string") {
            if (mode.mode === "id") return GetMode.ID;
            if (mode.mode === "details") return GetMode.DETAILS;
        } else if (Array.isArray(mode.mode)) {
            const extracted_mode = mode.mode.pop();
            if (extracted_mode === "id") return GetMode.ID;
            if (extracted_mode === "details") return GetMode.DETAILS;
        }
        return GetMode.DEFAULT;
    };

    @Get()
    async get(
        @Req() req: Request,
        @Query() query: QueryMode,
        @Res({ passthrough: true }) res: Response
    ) {
        const mode = this.selectGetMode(query);
        console.log("mode " + mode);
        const user = await this.checkAuthorization(req, res, Type.GET_ALL);
        if (!(user instanceof User)) return user;

        return {
            status: "OK",
            code: 200,
            description: "All orders",
            data: "Oé oé oé"
        };
    }

    @Get("/user/:user_id")
    async getUserOrders(
        @Req() req: Request,
        @Param("user_id") user_id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.checkAuthorization(req, res, Type.GET_USER, null, user_id);
        if (!(user instanceof User)) return user;

        const orders = await this.orderHistoryService.find({ user_id: user_id });

        res.status(200);
        return {
            status: "OK",
            code: 200,
            description: "User orders",
            data: orders
        };
    }

    @Get("/order/:order_id")
    async getOrder(
        @Req() req: Request,
        @Param("order_id") order_id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        const order = await this.orderHistoryService.findOne({ id: order_id });

        const user = await this.checkAuthorization(req, res, Type.GET_ORDER, order);
        if (!(user instanceof User)) return user;

        res.status(200);
        return {
            status: "OK",
            code: 200,
            description: "Order item",
            data: order
        };
    }

    @Post()
    async post(
        @Req() req: Request,
        @Body() item: QueryPartialEntity<OrderHistory>,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.checkAuthorization(req, res, Type.POST);
        if (!(user instanceof User)) return user;

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

    async checkAuthorization(
        req: Request,
        res: Response,
        type: Type,
        order: OrderHistory = null,
        user_id: number = null
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
                    "You have to login in order to create or get an order",
                data: null
            };
        }

        const user = await this.userService.findOne({ id: data["id"] });

        if (!user) {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                description: "You are not allowed to create or get an order",
                data: null
            };
        }

        switch (type) {
            case Type.GET_ALL:
                if (user.role !== "admin") {
                    res.status(403);
                    return {
                        status: "KO",
                        code: 403,
                        description:
                            "You are not allowed to get all orders, you must be an admin",
                        data: null
                    };
                }
                break;
            case Type.GET_ORDER:
                if (!order) {
                    res.status(404);
                    return {
                        status: "KO",
                        code: 404,
                        description: "Order was not found",
                        data: null
                    };
                }

                if (order.user_id !== user.id) {
                    if (user.role !== "admin") {
                        res.status(403);
                        return {
                            status: "KO",
                            code: 403,
                            description:
                                "You are not allowed to get this order",
                            data: null
                        };
                    }
                }
                break;
            case Type.GET_USER:
                if (!user_id) {
                    res.status(400);
                    return {
                        status: "KO",
                        code: 400,
                        description:
                            "User id must be specified in order to get orders for a user",
                        data: null
                    };
                }

                const user_to_get = await this.userService.findOne({
                    id: user_id
                });
                if (!user_to_get) {
                    res.status(404);
                    return {
                        status: "KO",
                        code: 404,
                        description:
                            "User was not found, so you can't access to his orders",
                        data: null
                    };
                }

                if (user_to_get.id !== user.id) {
                    if (user.role !== "admin") {
                        res.status(403);
                        return {
                            status: "KO",
                            code: 403,
                            description:
                                "You are not allowed to get orders for this user",
                            data: null
                        };
                    }
                }
                break;
            case Type.POST:
                break;
        }
        return user;
    }
}
