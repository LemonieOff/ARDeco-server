import { Test, TestingModule } from "@nestjs/testing";
import { OrderController } from "./order.controller";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import { UserService } from "../user/user.service";
import { CartService } from "../cart/cart.service";
import { MailService } from "../mail/mail.service";
import { OrderService } from "./order.service";
import { Order } from "./models/order.entity";
import { User } from "../user/models/user.entity";
import { of } from "rxjs";

describe("OrderController", () => {
    let controller: OrderController;
    let orderService: Partial<OrderService>;
    let jwtService: Partial<JwtService>;
    let userService: Partial<UserService>;
    let cartService: Partial<CartService>;
    let mailService: Partial<MailService>;

    beforeEach(async () => {
        orderService = {
            all: jest.fn().mockReturnValue(of([])),
            allIds: jest.fn().mockReturnValue(of([])),
            findOne: jest.fn().mockReturnValue(of(new Order())),
            find: jest.fn().mockReturnValue(of([])),
            create: jest.fn().mockReturnValue(of(new Order()))
        };

        jwtService = {
            verify: jest.fn().mockReturnValue({ id: 1 })
        };

        userService = {
            findOne: jest.fn().mockReturnValue(of(new User()))
        };

        cartService = {
            getCartForUser: jest.fn().mockResolvedValue(Promise.resolve(null))
        };

        mailService = {
            sendInvoice: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [OrderController],
            providers: [
                { provide: OrderService, useValue: orderService },
                { provide: JwtService, useValue: jwtService },
                { provide: UserService, useValue: userService },
                { provide: CartService, useValue: cartService },
                { provide: MailService, useValue: mailService }
            ]
        }).compile();

        controller = module.get<OrderController>(OrderController);
    });

    it("should return total number of orders", async () => {
        const req = { cookies: { jwt: "token" } } as Request;
        const res = { status: jest.fn() } as unknown as Response;
        jest.spyOn(controller, "checkAuthorization").mockResolvedValue(new User());

        await controller.get(req, { mode: undefined }, res);

        expect(orderService.allIds).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return all orders details", async () => {
        const req = { cookies: { jwt: "token" } } as Request;
        const res = { status: jest.fn() } as unknown as Response;
        jest.spyOn(controller, "checkAuthorization").mockResolvedValue(new User());

        await controller.get(req, { mode: "details" }, res);

        expect(orderService.all).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return user orders based on ID", async () => {
        const req = { cookies: { jwt: "token" } } as Request;
        const res = { status: jest.fn() } as unknown as Response;
        jest.spyOn(controller, "checkAuthorization").mockResolvedValue(new User());
        jest.spyOn(orderService, "find").mockResolvedValue([

            { id: 1, user_id: 1, total_amount: 100, furniture: [] } as Order,
            { id: 2, user_id: 1, total_amount: 150, furniture: [] } as Order,
            { id: 3, user_id: 2, total_amount: 200, furniture: [] } as Order
        ])

        await controller.getUserOrders(req, { mode: "id" }, 1, res);

        expect(orderService.find).toHaveBeenCalledWith({ user_id: 1 });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should create order when cart is not empty", async () => {
        const req = { cookies: { jwt: "token" } } as Request;
        const res = { status: jest.fn() } as unknown as Response;
        jest.spyOn(controller, "checkAuthorization").mockResolvedValue(new User());
        jest.spyOn(cartService, "getCartForUser").mockResolvedValue(Promise.resolve({ id: 1, total_amount: 100, items: [] }));

        await controller.post(req, res);

        expect(orderService.create).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should return 404 if cart is empty", async () => {
        const req = { cookies: { jwt: "token" } } as Request;
        const res = { status: jest.fn() } as unknown as Response;
        jest.spyOn(controller, "checkAuthorization").mockResolvedValue(new User());

        await controller.post(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

});
