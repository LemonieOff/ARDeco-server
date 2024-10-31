import { Test, TestingModule } from "@nestjs/testing";
import { StreamableFile } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { User } from "../user/models/user.entity";
import { Order } from "./models/order.entity";
import { Request, Response } from "express";
import { createReadStream } from "fs";
import * as fs from "node:fs";

describe("OrderController", () => {
    let controller: OrderController;
    let orderHistoryService: OrderService;
    let userService: UserService;
    let jwtService: JwtService;

    const mockUser = new User();
    mockUser.id = 1;
    mockUser.role = "client";

    const mockOrder = new Order();
    mockOrder.id = 10;
    mockOrder.user_id = mockUser.id;

    const mockRequest = {
        cookies: { jwt: "validJwtToken" }
    } as Request;
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        set: jest.fn(),
        send: jest.fn()
    } as unknown as Response;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [OrderController],
            providers: [
                {
                    provide: OrderService,
                    useValue: {
                        all: jest.fn(),
                        allIds: jest.fn(),
                        create: jest.fn(),
                        findOne: jest.fn(),
                        find: jest.fn()
                    }
                },
                {
                    provide: JwtService,
                    useValue: {
                        verify: jest.fn().mockReturnValue({ id: 1 })
                    }
                },
                {
                    provide: UserService,
                    useValue: {
                        findOne: jest.fn().mockResolvedValue(mockUser)
                    }
                }
            ]
        }).compile();

        controller = module.get<OrderController>(OrderController);
        orderHistoryService = module.get<OrderService>(OrderService);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("selectGetMode", () => {
        it("should return GetMode.DEFAULT for no mode", () => {
            expect(controller["selectGetMode"]({ mode: undefined })).toBe(0); // GetMode.DEFAULT
        });

        it("should return GetMode.DEFAULT for an invalid string mode", () => {
            expect(controller["selectGetMode"]({ mode: "invalid" })).toBe(0); // GetMode.DEFAULT
        });

        it("should return GetMode.DEFAULT for an invalid array mode", () => {
            expect(controller["selectGetMode"]({ mode: ["invalid"] })).toBe(0); // GetMode.DEFAULT
        });

        it("should return GetMode.ID for 'id' mode", () => {
            expect(controller["selectGetMode"]({ mode: "id" })).toBe(1); // GetMode.ID
        });

        it("should return GetMode.DETAILS for 'details' mode", () => {
            expect(controller["selectGetMode"]({ mode: "details" })).toBe(2); // GetMode.DETAILS
        });

        it("should return GetMode.ID for ['id'] mode", () => {
            expect(controller["selectGetMode"]({ mode: ["id"] })).toBe(1); // GetMode.ID
        });

        it("should return GetMode.DETAILS for ['details'] mode", () => {
            expect(controller["selectGetMode"]({ mode: ["details"] })).toBe(2); // GetMode.DETAILS
        });

        it("should return GetMode.DEFAULT for ['other', 'id'] mode (only the last element matters)", () => {
            expect(controller["selectGetMode"]({ mode: ["other", "id"] })).toBe(1); // GetMode.ID
        });
    });

    describe("get", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller.get(req, { mode: undefined }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You have to login in order to create or get an order",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.get(mockRequest, { mode: undefined }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to create or get an order",
                data: null
            });
        });

        it("should return 403 if user is not admin (GetMode.DEFAULT)", async () => {
            const result = await controller.get(mockRequest, { mode: undefined }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to get all orders, you must be an admin",
                data: null
            });
        });

        it("should return 403 if user is not admin (GetMode.ID)", async () => {
            const result = await controller.get(mockRequest, { mode: "id" }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to get all orders, you must be an admin",
                data: null
            });
        });

        it("should return 403 if user is not admin (GetMode.DETAILS)", async () => {
            const result = await controller.get(mockRequest, { mode: "details" }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to get all orders, you must be an admin",
                data: null
            });
        });

        it("should return 200 and the total number of orders (GetMode.DEFAULT)", async () => {
            mockUser.role = "admin";
            const mockOrders = [1, 2, 3];
            jest.spyOn(orderHistoryService, "allIds").mockResolvedValue(mockOrders as any);
            const result = await controller.get(mockRequest, { mode: undefined }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Total number of orders",
                data: mockOrders.length
            });
        });

        it("should return 200 and all order IDs (GetMode.ID)", async () => {
            mockUser.role = "admin";
            const mockOrders = [1, 2, 3];
            jest.spyOn(orderHistoryService, "allIds").mockResolvedValue(mockOrders as any);
            const result = await controller.get(mockRequest, { mode: "id" }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "All orders ids",
                data: mockOrders
            });
        });

        it("should return 200 and all order details (GetMode.DETAILS)", async () => {
            mockUser.role = "admin";
            const mockOrderDetails = [{ id: 1 }, { id: 2 }, { id: 3 }];
            jest.spyOn(orderHistoryService, "all").mockResolvedValue(mockOrderDetails as any);
            const result = await controller.get(mockRequest, { mode: "details" }, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "All orders details",
                data: mockOrderDetails
            });
        });
    });

    describe("getUserOrders", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller.getUserOrders(req, { mode: undefined }, 1, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You have to login in order to create or get an order",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.getUserOrders(mockRequest, { mode: undefined }, 1, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to create or get an order",
                data: null
            });
        });

        it("should return 400 if user_id is not specified (GetMode.GET_USER)", async () => {
            const result = await controller.getUserOrders(mockRequest, { mode: undefined }, null, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "User id must be specified in order to get orders for a user",
                data: null
            });
        });

        it("should return 404 if specified user is not found (GetMode.GET_USER)", async () => {
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(mockUser)
                .mockResolvedValueOnce(null);
            const result = await controller.getUserOrders(mockRequest, { mode: undefined }, 2, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "User was not found, so you can't access to his orders",
                data: null
            });
        });

        it("should return 403 if user is not the owner nor an admin (GetMode.GET_USER)", async () => {
            const localUser = { ...mockUser, role: "client" };
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(localUser)
                .mockResolvedValueOnce({ id: 2 } as any);
            const result = await controller.getUserOrders(mockRequest, { mode: undefined }, 2, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to get orders for this user",
                data: null
            });
        });

        it("should return 200 and the total number of orders for the user (GetMode.DEFAULT)", async () => {
            const mockOrders = [{ id: 10 }, { id: 11 }, { id: 12 }];
            jest.spyOn(orderHistoryService, "find").mockResolvedValue(mockOrders as any);
            const result = await controller.getUserOrders(mockRequest, { mode: undefined }, 1, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Total number of orders",
                data: mockOrders.length
            });
        });

        it("should return 200 and all order IDs for the user (GetMode.ID)", async () => {
            const mockOrders = [{ id: 10 }, { id: 11 }, { id: 12 }];
            jest.spyOn(orderHistoryService, "find").mockResolvedValue(mockOrders as any);
            const result = await controller.getUserOrders(mockRequest, { mode: "id" }, 1, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "All orders ids",
                data: [10, 11, 12]
            });
        });

        it("should return 200 and all order details for the user (GetMode.DETAILS)", async () => {
            const mockOrders = [{ id: 10 }, { id: 11 }, { id: 12 }];
            jest.spyOn(orderHistoryService, "find").mockResolvedValue(mockOrders as any);
            const result = await controller.getUserOrders(mockRequest, { mode: "details" }, 1, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "All orders details",
                data: mockOrders
            });
        });
    });

    describe("getOrder", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller.getOrder(req, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You have to login in order to create or get an order",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.getOrder(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to create or get an order",
                data: null
            });
        });

        it("should return 404 if order is not found", async () => {
            jest.spyOn(orderHistoryService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.getOrder(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Order was not found",
                data: null
            });
        });

        it("should return 403 if user is not the owner nor an admin", async () => {
            const localUser = { ...mockUser, role: "client" };
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(localUser);
            const order = { ...mockOrder, user_id: 2 };
            jest.spyOn(orderHistoryService, "findOne").mockResolvedValueOnce(order as any);
            const result = await controller.getOrder(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to get this order",
                data: null
            });
        });

        it("should return 200 and the order details if authorized", async () => {
            jest.spyOn(orderHistoryService, "findOne").mockResolvedValueOnce(mockOrder as any);
            const result = await controller.getOrder(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Order item",
                data: mockOrder
            });
        });
    });

    describe("post", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller.post(req, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You have to login in order to create or get an order",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.post(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to create or get an order",
                data: null
            });
        });

        it("should create a new order history item and return 201", async () => {
            const createdOrder = { ...mockOrder, id: 11 };
            jest.spyOn(orderHistoryService, "create").mockResolvedValueOnce(createdOrder as any);
            const result = await controller.post(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(result).toEqual({
                status: "OK",
                code: 201,
                description: "Order history item was created",
                data: createdOrder
            });
        });

        it("should return 400 if there's an error creating the order", async () => {
            jest.spyOn(orderHistoryService, "create").mockRejectedValueOnce(new Error("Database error"));
            const result = await controller.post(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "Order history item was not created because of an error",
                error: expect.any(Error),
                data: null
            });
        });
    });

    describe("getInvoice", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller.getInvoice(req, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You have to login in order to create or get an order",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.getInvoice(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to create or get an order",
                data: null
            });
        });

        it("should return 404 if order is not found", async () => {
            jest.spyOn(orderHistoryService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.getInvoice(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Order was not found",
                data: null
            });
        });

        it("should return 403 if user is not the owner nor an admin", async () => {
            const localUser = { ...mockUser, role: "client" };
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(localUser);
            const order = { ...mockOrder, user_id: 2 };
            jest.spyOn(orderHistoryService, "findOne").mockResolvedValueOnce(order as any);
            const result = await controller.getInvoice(mockRequest, 10, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to get this order",
                data: null
            });
        });

        it("should return 200 and the invoice if authorized", async () => {
            jest.spyOn(fs, "createReadStream").mockReturnValue({} as any);
            jest.spyOn(orderHistoryService, "findOne").mockResolvedValueOnce(mockOrder as any);
            const result = await controller.getInvoice(mockRequest, 10, mockResponse);
            expect(mockResponse.set).toHaveBeenCalledWith({
                "Content-Disposition": `attachment; filename="ardeco_invoice_10.pdf"`,
                "Content-Type": "application/pdf"
            });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toBeInstanceOf(StreamableFile);
        });
    });

    describe("checkAuthorization", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller["checkAuthorization"](req, mockResponse, 3);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You have to login in order to create or get an order",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller["checkAuthorization"](mockRequest, mockResponse, 3);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to create or get an order",
                data: null
            });
        });

        describe("when type is GET_ALL", () => {
            it("should return 403 if user is not admin", async () => {
                const localUser = { ...mockUser, role: "client" };
                jest.spyOn(userService, "findOne").mockResolvedValueOnce(localUser);
                const result = await controller["checkAuthorization"](mockRequest, mockResponse, 0);
                expect(mockResponse.status).toHaveBeenCalledWith(403);
                expect(result).toEqual({
                    status: "KO",
                    code: 403,
                    description: "You are not allowed to get all orders, you must be an admin",
                    data: null
                });
            });

            it("should return user if authorized", async () => {
                mockUser.role = "admin";
                const result = await controller["checkAuthorization"](mockRequest, mockResponse, 0);
                expect(result).toEqual(mockUser);
            });
        });

        describe("when type is GET_ORDER", () => {
            it("should return 404 if order is not found", async () => {
                const result = await controller["checkAuthorization"](mockRequest, mockResponse, 2, null);
                expect(mockResponse.status).toHaveBeenCalledWith(404);
                expect(result).toEqual({
                    status: "KO",
                    code: 404,
                    description: "Order was not found",
                    data: null
                });
            });

            it("should return 403 if user is not the owner nor an admin", async () => {
                const localUser = { ...mockUser, role: "client" };
                jest.spyOn(userService, "findOne").mockResolvedValueOnce(localUser);
                const order = { ...mockOrder, user_id: 2 };
                const result = await controller["checkAuthorization"](mockRequest, mockResponse, 2, order as any);
                expect(mockResponse.status).toHaveBeenCalledWith(403);
                expect(result).toEqual({
                    status: "KO",
                    code: 403,
                    description: "You are not allowed to get this order",
                    data: null
                });
            });

            it("should return user if authorized as the owner", async () => {
                const result = await controller["checkAuthorization"](mockRequest, mockResponse, 2, mockOrder);
                expect(result).toEqual(mockUser);
            });

            it("should return user if authorized as an admin", async () => {
                mockUser.role = "admin";
                const order = { ...mockOrder, user_id: 2 };
                const result = await controller["checkAuthorization"](mockRequest, mockResponse, 2, order as any);
                expect(result).toEqual(mockUser);
            });
        });

        describe("when type is GET_USER", () => {
            it("should return 400 if user_id is not specified", async () => {
                const result = await controller["checkAuthorization"](mockRequest, mockResponse, 1, mockOrder, null);
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(result).toEqual({
                    status: "KO",
                    code: 400,
                    description: "User id must be specified in order to get orders for a user",
                    data: null
                });
            });

            it("should return 404 if specified user is not found", async () => {
                jest.spyOn(userService, "findOne")
                    .mockResolvedValueOnce(mockUser)
                    .mockResolvedValueOnce(null);
                const result = await controller["checkAuthorization"](mockRequest, mockResponse, 1, mockOrder, 2);
                expect(mockResponse.status).toHaveBeenCalledWith(404);
                expect(result).toEqual({
                    status: "KO",
                    code: 404,
                    description: "User was not found, so you can't access to his orders",
                    data: null
                });
            });

            it("should return 403 if user is not the target nor an admin", async () => {
                const localUser = { ...mockUser, role: "client" };
                jest.spyOn(userService, "findOne")
                    .mockResolvedValueOnce(localUser)
                    .mockResolvedValueOnce({ id: 2 } as any);
                const result = await controller["checkAuthorization"](mockRequest, mockResponse, 1, mockOrder, 2);
                expect(mockResponse.status).toHaveBeenCalledWith(403);
                expect(result).toEqual({
                    status: "KO",
                    code: 403,
                    description: "You are not allowed to get orders for this user",
                    data: null
                });
            });

            it("should return user if authorized as target user", async () => {
                jest.spyOn(userService, "findOne")
                    .mockResolvedValueOnce(mockUser)
                    .mockResolvedValueOnce(mockUser);
                const result = await controller["checkAuthorization"](mockRequest, mockResponse, 1, mockOrder, 1);
                expect(result).toEqual(mockUser);
            });

            it("should return user if authorized as an admin", async () => {
                mockUser.role = "admin";
                jest.spyOn(userService, "findOne")
                    .mockResolvedValueOnce(mockUser)
                    .mockResolvedValueOnce({ id: 2 } as any);
                const result = await controller["checkAuthorization"](mockRequest, mockResponse, 1, mockOrder, 2);
                expect(result).toEqual(mockUser);
            });
        });

        describe("when type is POST", () => {
            it("should return user if authorized", async () => {
                const result = await controller["checkAuthorization"](mockRequest, mockResponse, 3);
                expect(result).toEqual(mockUser);
            });
        });
    });
});
