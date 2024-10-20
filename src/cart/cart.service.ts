import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsRelations, FindOptionsSelect, FindOptionsWhere, Repository } from "typeorm";
import { Cart } from "./models/cart.entity";
import { CartItem } from "./models/cart_item.entity";
import { CartResponseDto } from "./dtos/CartResponse.dto";

@Injectable()
export class CartService {
    constructor(@InjectRepository(Cart) private readonly cartRepository: Repository<Cart>) {
    }

    async create(user_id: number, colorIds: number[]): Promise<CartResponseDto> {
        const tmpCart = new Cart();
        tmpCart.user_id = user_id;
        tmpCart.items = [];

        return this.addItems(tmpCart, colorIds);
    }

    async addItems(cart: Cart, colorIds: number[]): Promise<CartResponseDto> {
        for (const id of colorIds) {
            const item = cart.items.findIndex((x) => x.color_id === id);
            if (item > -1) {
                cart.items[item].quantity++;
            } else {
                const newItem = new CartItem();
                newItem.color_id = id;
                newItem.cart = cart;
                newItem.quantity = 1;

                cart.items.push(newItem);
            }
        }

        const newCart = await this.cartRepository.save(cart);
        console.log("Items added to cart " + newCart.id);

        return this.getCart(newCart.id);
    }

    async getCart(cart_id: number): Promise<CartResponseDto | null> {
        const cart = await this.findOne({ id: cart_id }, {
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
        }, {
            items: {
                color: {
                    furniture: true
                },
                cart: false
            }
        });

        if (cart) {
            return {
                id: cart.id,
                total_amount: cart.items.reduce((a, b) => a + (b.color.furniture.price * b.quantity), 0),
                items: cart.items.map(item => ({
                    quantity: item.quantity,
                    furniture: {
                        id: item.color.furniture.id,
                        name: item.color.furniture.name,
                        color: item.color.color,
                        color_id: item.color_id,
                        model_id: item.color.model_id,
                        price: item.color.furniture.price
                    }
                }))
            };
        } else {
            return null;
        }
    }

    async findOne(where: FindOptionsWhere<Cart>, select: FindOptionsSelect<Cart> = {}, relations: FindOptionsRelations<Cart> = {}): Promise<Cart> {
        return await this.cartRepository.findOne({ where: where, select: select, relations: relations });
    }

    async removeItem(cart: Cart, color_id: number): Promise<CartResponseDto | null> {
        const item = cart.items.findIndex(x => x.color_id === color_id);
        if (item > -1) {
            cart.items[item].quantity--;
            if (cart.items[item].quantity <= 0) {
                cart.items = cart.items.filter((x) => {
                    return x.color_id !== color_id;
                });
            }
        }

        if (cart.items.length === 0) {
            await this.cartRepository.remove(cart);
            console.log("Item removed from cart " + cart.id + ", and cart has been deleted as there was no remaining item");
        } else {
            await this.cartRepository.save(cart);
            console.log("Item removed from cart " + cart.id);
        }

        return this.getCart(cart.id);
    }

    async delete(id: number) {
        console.log("Deleting cart : ", id);
        return this.cartRepository.delete({ id: id });
    }
}
