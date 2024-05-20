import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cart } from "./models/cart.entity";
import { CartService } from "./cart.service";
import { AuthGuard } from "src/auth/auth.guard";
import { ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

describe("CartService", () => {
    let service: CartService;
    let cartRepository: Repository<Cart>;

    const mockAuthGuard = {
        canActivate: jest.fn((context: ExecutionContext) => true) // Allow access by default
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CartService,
                {
                    provide: getRepositoryToken(Cart),
                    useValue: {
                        find: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn(),
                        createQueryBuilder: jest.fn(() => ({
                            delete: jest.fn().mockReturnThis(),
                            from: jest.fn().mockReturnThis(),
                            where: jest.fn().mockReturnThis(),
                            execute: jest.fn()
                        })),
                        delete: jest.fn()
                    }
                },
                {
                    provide: AuthGuard,
                    useValue: mockAuthGuard
                },
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn().mockResolvedValue("token"),
                        verify: jest.fn().mockReturnValue({ id: 1 }),
                        verifyAsync: jest.fn().mockResolvedValue({ id: 1 })
                    }
                }
            ]
        }).compile();

        service = module.get<CartService>(CartService);
        cartRepository = module.get<Repository<Cart>>(getRepositoryToken(Cart));
    });

    describe("all", () => {
        it("should return all cart items", async () => {
            const mockCarts = [new Cart(), new Cart()];
            jest.spyOn(cartRepository, "find").mockResolvedValue(mockCarts);

            const result = await service.all();
            expect(result).toEqual(mockCarts);
        });
    });

    describe("create", () => {
        it("should create a new cart item", async () => {
            const data = {
                product_id: 1,
                quantity: 2
            };
            const createdCart = { id: 1, ...data };
            jest.spyOn(cartRepository, "save").mockResolvedValue(createdCart as any);

            const result = await service.create(data);
            expect(result).toEqual(createdCart);
        });
    });

    describe("findOne", () => {
        it("should find a cart item by condition", async () => {
            const condition = { id: 1 };
            const mockCart = new Cart();
            jest.spyOn(cartRepository, "findOne").mockResolvedValue(mockCart);

            const result = await service.findOne(condition);
            expect(result).toEqual(mockCart);
        });
    });

    describe("update", () => {
        it("should update a cart item", async () => {
            const id = 1;
            const data = { quantity: 3 };
            jest.spyOn(cartRepository, "update").mockResolvedValue({ affected: 1 } as any);

            const result = await service.update(id, data);
            expect(result.affected).toBe(1);
        });
    });

    describe("delete", () => {
        it("should delete a cart item", async () => {
            const id = 1;
            jest.spyOn(cartRepository, "delete").mockReturnValue({
                raw: [],
                affected: 1
            } as any);
            const result = await service.delete(id);
            expect(result.affected).toBe(1);
        });
    });
});
