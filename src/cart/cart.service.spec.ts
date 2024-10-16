import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cart } from "./models/cart.entity";
import { CartService } from "./cart.service";
import { CartItem } from "./models/cart_item.entity";
import { Catalog } from "../catalog/models/catalog.entity"; // Import CartItem

describe("CartService", () => {
    let service: CartService;
    let cartRepository: Repository<Cart>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CartService,
                {
                    provide: getRepositoryToken(Cart),
                    useValue: {
                        save: jest.fn(),
                        findOne: jest.fn(),
                        remove: jest.fn(), // Add remove for delete functionality
                        delete: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<CartService>(CartService);
        cartRepository = module.get<Repository<Cart>>(getRepositoryToken(Cart));
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("create", () => {
        it("should create a new cart with items", async () => {
            const userId = 1;
            const colorIds = [1, 2, 3];
            const mockCart = new Cart();
            mockCart.id = 1;
            mockCart.user_id = userId;
            mockCart.items = colorIds.map(colorId => {
                const item = new CartItem();
                item.color_id = colorId;
                item.quantity = 1;
                return item;
            });

            jest.spyOn(cartRepository, "save").mockResolvedValue(mockCart);

            const result = await service.create(userId, colorIds);

            expect(cartRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                user_id: userId,
                items: expect.arrayContaining(mockCart.items)
            }));
            expect(result).toEqual(expect.objectContaining({
                id: mockCart.id
            }));
        });
    });

    describe("addItems", () => {
        it("should add new items to an existing cart", async () => {
            const cart = new Cart();
            cart.id = 1;
            cart.user_id = 1;
            cart.items = [];
            const colorIds = [1, 2];

            const updatedCart = { ...cart, items: colorIds.map(id => ({ color_id: id, quantity: 1 })) };
            jest.spyOn(cartRepository, "save").mockResolvedValue(updatedCart as any);

            const result = await service.addItems(cart, colorIds);
            expect(cartRepository.save).toHaveBeenCalledWith(expect.objectContaining(updatedCart));
            expect(result.items.length).toBe(2);
        });

        it("should increase quantity of existing items in the cart", async () => {
            const cart = new Cart();
            cart.id = 1;
            cart.user_id = 1;
            const existingItem = new CartItem();
            existingItem.color_id = 1;
            existingItem.quantity = 1;
            cart.items = [existingItem];
            const colorIds = [1, 2];

            const updatedCart = {
                ...cart,
                items: [
                    { color_id: 1, quantity: 2 },
                    { color_id: 2, quantity: 1 }
                ]
            };
            jest.spyOn(cartRepository, "save").mockResolvedValue(updatedCart as any);

            const result = await service.addItems(cart, colorIds);
            expect(cartRepository.save).toHaveBeenCalledWith(expect.objectContaining(updatedCart));
            expect(result.items.length).toBe(2);
            expect(result.items[0].quantity).toBe(2);
        });
    });

    describe("getCart", () => {
        it("should return a cart with items and furniture details", async () => {
            const cartId = 1;
            const mockCart = createMockCartWithItems();
            jest.spyOn(cartRepository, "findOne").mockResolvedValue(mockCart);

            const result = await service.getCart(cartId);

            expect(cartRepository.findOne).toHaveBeenCalledWith({
                where: { id: cartId },
                select: {
                    items: {
                        id: true,
                        quantity: true,
                        color_id: true,
                        color: {
                            id: true,
                            furniture_id: true,
                            color: true,
                            model_id: true,
                            furniture: {
                                name: true,
                                price: true,
                                id: true
                            }
                        }
                    }
                },
                relations: {
                    items: {
                        color: {
                            furniture: true
                        },
                        cart: false
                    }
                }
            });
            expect(result).toEqual(expect.objectContaining({
                id: mockCart.id,
                items: expect.arrayContaining([
                    expect.objectContaining({
                        quantity: mockCart.items[0].quantity,
                        furniture: expect.objectContaining({
                            id: mockCart.items[0].color.furniture.id,
                            name: mockCart.items[0].color.furniture.name
                        })
                    })
                ])
            }));
        });

        it("should return null if cart is not found", async () => {
            const cartId = 1;
            jest.spyOn(cartRepository, "findOne").mockResolvedValue(null);

            const result = await service.getCart(cartId);

            expect(result).toBeNull();
        });
    });

    describe("removeItem", () => {
        it("should decrease the quantity of an item in the cart", async () => {
            const cart = createMockCartWithItems();
            const colorIdToRemove = cart.items[0].color_id;

            jest.spyOn(cartRepository, "save").mockResolvedValue(cart as any);

            const result = await service.removeItem(cart, colorIdToRemove);

            expect(cartRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                items: expect.arrayContaining([
                    expect.objectContaining({
                        color_id: colorIdToRemove,
                        quantity: cart.items[0].quantity - 1
                    })
                ])
            }));
        });

        it("should remove an item from the cart if quantity becomes 0", async () => {
            const cart = createMockCartWithItems();
            const colorIdToRemove = cart.items[0].color_id;
            cart.items[0].quantity = 1; // Set quantity to 1 so it gets removed

            jest.spyOn(cartRepository, "save").mockResolvedValue(cart as any);

            const result = await service.removeItem(cart, colorIdToRemove);

            expect(cartRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                items: expect.not.arrayContaining([
                    expect.objectContaining({
                        color_id: colorIdToRemove
                    })
                ])
            }));
        });

        it("should delete the cart if it becomes empty after removing an item", async () => {
            const cart = createMockCartWithItems();
            cart.items.length = 1; // Make sure there's only one item
            const colorIdToRemove = cart.items[0].color_id;
            cart.items[0].quantity = 1; // Set quantity to 1 so it gets removed

            jest.spyOn(cartRepository, "remove").mockResolvedValue(undefined);

            await service.removeItem(cart, colorIdToRemove);

            expect(cartRepository.remove).toHaveBeenCalledWith(cart);
        });
    });

    describe("delete", () => {
        it("should delete a cart by ID", async () => {
            const cartId = 1;
            jest.spyOn(cartRepository, "delete").mockResolvedValue({
                raw: [],
                affected: 1
            } as any);

            const result = await service.delete(cartId);

            expect(cartRepository.delete).toHaveBeenCalledWith({ id: cartId });
            expect(result.affected).toBe(1);
        });
    });
});

// Helper function to create a mock cart with items
function createMockCartWithItems(): Cart {
    const cart = new Cart();
    cart.id = 1;
    cart.user_id = 1;

    const item1 = new CartItem();
    item1.color_id = 1;
    item1.quantity = 2;
    item1.color = {
        id: 1,
        furniture_id: 1,
        color: "red",
        model_id: 1,
        furniture: {
            id: 1,
            name: "Chair",
            price: 100
        } as Catalog
    };

    cart.items = [item1];
    return cart;
}
