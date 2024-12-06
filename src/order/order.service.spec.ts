import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "./models/order.entity";
import { OrderService } from "./order.service";
import { User } from "../user/models/user.entity";
import { CartOrderResponseDto } from "../cart/dtos/CartOrderResponse.dto";

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
                        findOne: jest.fn(),
                        save: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<OrderService>(OrderService);
        orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("all", () => {
        it("should return all orders", async () => {
            const mockOrders = [new Order(), new Order()];
            jest.spyOn(orderRepository, "find").mockResolvedValue(mockOrders);

            const result = await service.all();

            expect(orderRepository.find).toHaveBeenCalled();
            expect(result).toEqual(mockOrders);
        });
    });

    describe("allIds", () => {
        it("should return an array of order IDs", async () => {
            const mockOrders = [{ id: 1 }, { id: 2 }] as Order[];
            jest.spyOn(orderRepository, "find").mockResolvedValue(mockOrders);

            const result = await service.allIds();

            expect(orderRepository.find).toHaveBeenCalled();
            expect(result).toEqual([1, 2]);
        });
    });

    describe("create", () => {
        it("should create a new order", async () => {
            const mockUser = new User();
            mockUser.id = 1;
            mockUser.first_name = "John";
            mockUser.last_name = "Doe";
            mockUser.email = "john.doe@example.com";

            const mockCart: CartOrderResponseDto = {
                id: 1,
                total_amount: 250,
                items: [
                    {
                        quantity: 1,
                        furniture: {
                            id: 1,
                            name: "Chair",
                            color: "Red",
                            color_id: 1,
                            model_id: 1,
                            price: 100,
                            company: "IKEA",
                            object_id: "ikea-chair-red"
                        },
                        amount: 100
                    },
                    {
                        quantity: 3,
                        furniture: {
                            id: 2,
                            name: "Table",
                            color: "Blue",
                            color_id: 2,
                            model_id: 2,
                            price: 50,
                            company: "Wayfair",
                            object_id: "wayfair-table-blue"
                        },
                        amount: 150
                    }
                ]
            };

            const mockOrder = new Order();
            mockOrder.user = mockUser;
            mockOrder.name = `${mockUser.first_name} ${mockUser.last_name}`;
            mockOrder.total_amount = mockCart.total_amount;
            mockOrder.furniture = mockCart.items.map(item => ({
                id: item.furniture.id,
                amount: item.amount,
                quantity: item.quantity,
                color: item.furniture.color,
                color_id: item.furniture.color_id,
                price: item.furniture.price,
                company: item.furniture.company,
                name: item.furniture.name,
                object_id: item.furniture.object_id
            }));

            jest.spyOn(orderRepository, "save").mockResolvedValue(mockOrder as any);
            const result = await service.create(mockUser, mockCart);
            expect(result).toEqual(mockOrder);
            expect(orderRepository.save).toHaveBeenCalledWith(mockOrder);
        });
    });

    describe("findOne", () => {
        it("should find an order by condition", async () => {
            const condition = { id: 1 };
            const mockOrder = new Order();
            jest.spyOn(orderRepository, "findOne").mockResolvedValue(mockOrder);

            const result = await service.findOne(condition);

            expect(orderRepository.findOne).toHaveBeenCalledWith({ where: condition });
            expect(result).toEqual(mockOrder);
        });
    });

    describe("find", () => {
        it("should find orders by condition", async () => {
            const condition = { user_id: 1 };
            const mockOrders = [new Order(), new Order()];
            jest.spyOn(orderRepository, "find").mockResolvedValue(mockOrders);

            const result = await service.find(condition);

            expect(orderRepository.find).toHaveBeenCalledWith({ where: condition });
            expect(result).toEqual(mockOrders);
        });
    });
});
