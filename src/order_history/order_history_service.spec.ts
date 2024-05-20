import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OrderHistory } from "./models/order_history.entity";
import { OrderHistoryService } from "./order_history_service";

describe("OrderHistoryService", () => {
    let service: OrderHistoryService;
    let orderHistoryRepository: Repository<OrderHistory>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderHistoryService,
                {
                    provide: getRepositoryToken(OrderHistory),
                    useValue: {
                        find: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<OrderHistoryService>(OrderHistoryService);
        orderHistoryRepository = module.get<Repository<OrderHistory>>(
            getRepositoryToken(OrderHistory)
        );
    });

    describe("all", () => {
        it("should return all order history items", async () => {
            const mockOrders = [new OrderHistory(), new OrderHistory()];
            jest.spyOn(orderHistoryRepository, "find").mockResolvedValue(mockOrders);

            const result = await service.all();
            expect(result).toEqual(mockOrders);
        });
    });

    describe("allIds", () => {
        it("should return an array of order history IDs", async () => {
            const mockOrders = [{ id: 1 }, { id: 2 }];
            jest.spyOn(orderHistoryRepository, "find").mockResolvedValue(mockOrders as any);

            const result = await service.allIds();
            expect(result).toEqual([1, 2]);
        });
    });

    describe("create", () => {
        it("should create a new order history item with valid JSON", async () => {
            const data = { furniture: '{"item1": 1, "item2": 2}' };
            const createdItem = new OrderHistory();
            Object.assign(createdItem, data, { id: 1 });

            jest.spyOn(orderHistoryRepository, "save").mockResolvedValue(createdItem);

            const result = await service.create(data);
            expect(result).toEqual(createdItem);
        });

        it("should reject with a JsonError if furniture is not valid JSON", async () => {
            const data = { furniture: "invalid JSON" };

            await expect(service.create(data)).rejects.toEqual({
                error: "JsonError",
                message: "Furniture is not a valid JSON object",
                furniture: data.furniture,
            });
        });
    });

    describe("findOne", () => {
        it("should find an order history item by condition", async () => {
            const condition = { id: 1 };
            const mockOrder = new OrderHistory();
            jest.spyOn(orderHistoryRepository, "findOne").mockResolvedValue(mockOrder);

            const result = await service.findOne(condition);
            expect(result).toEqual(mockOrder);
        });
    });

    describe("find", () => {
        it("should find multiple order history items by condition", async () => {
            const condition = { user_id: 1 };
            const mockOrders = [new OrderHistory(), new OrderHistory()];
            jest.spyOn(orderHistoryRepository, "find").mockResolvedValue(mockOrders);

            const result = await service.find(condition);
            expect(result).toEqual(mockOrders);
        });
    });
});
