import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "./models/order.entity";
import { OrderService } from "./order.service";

describe("OrderService", () => {
    let service: OrderService;
    let orderRepository: Repository<Order>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderService,
                {
                    provide: getRepositoryToken(Order),
                    useValue: {
                        find: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<OrderService>(OrderService);
        orderRepository = module.get<Repository<Order>>(
            getRepositoryToken(Order)
        );
    });

    describe("all", () => {
        it("should return all order history items", async () => {
            const mockOrders = [new Order(), new Order()];
            jest.spyOn(orderRepository, "find").mockResolvedValue(mockOrders);

            const result = await service.all();
            expect(result).toEqual(mockOrders);
        });
    });

    describe("allIds", () => {
        it("should return an array of order history IDs", async () => {
            const mockOrders = [{ id: 1 }, { id: 2 }];
            jest.spyOn(orderRepository, "find").mockResolvedValue(mockOrders as any);

            const result = await service.allIds();
            expect(result).toEqual([1, 2]);
        });
    });

    describe("create", () => {
        it("should create a new order history item with valid JSON", async () => {
            const data = { furniture: "{\"item1\": 1, \"item2\": 2}" };
            const createdItem = new Order();
            Object.assign(createdItem, data, { id: 1 });

            jest.spyOn(orderRepository, "save").mockResolvedValue(createdItem);

            const result = await service.create(undefined, data);
            expect(result).toEqual(createdItem);
        });

        it("should reject with a JsonError if furniture is not valid JSON", async () => {
            const data = { furniture: "invalid JSON" };

            await expect(service.create(undefined, data)).rejects.toEqual({
                error: "JsonError",
                message: "Furniture is not a valid JSON object",
                furniture: data.furniture
            });
        });
    });

    describe("findOne", () => {
        it("should find an order history item by condition", async () => {
            const condition = { id: 1 };
            const mockOrder = new Order();
            jest.spyOn(orderRepository, "findOne").mockResolvedValue(mockOrder);

            const result = await service.findOne(condition);
            expect(result).toEqual(mockOrder);
        });
    });

    describe("find", () => {
        it("should find multiple order history items by condition", async () => {
            const condition = { user_id: 1 };
            const mockOrders = [new Order(), new Order()];
            jest.spyOn(orderRepository, "find").mockResolvedValue(mockOrders);

            const result = await service.find(condition);
            expect(result).toEqual(mockOrders);
        });
    });
});
