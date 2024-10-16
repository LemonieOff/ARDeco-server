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

    async all(): Promise<Cart[]> {
        return this.cartRepository.find();
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

        const loadCart = await this.findOne({ id: newCart.id }, {
            items: {
                id: true,
                quantity: true,
                color_id: true,
                color: {
                    id: true,
                    furniture_id: true,
                    color: true,
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

        console.log("LOAD CART : ", loadCart);

        return {
            id: newCart.id,
            items: loadCart.items.map(item => ({
                color_id: item.color_id,
                quantity: item.quantity,
                furniture: {
                    id: item.color.furniture.id,
                    name: item.color.furniture.name,
                    color: item.color.color,
                    price: item.color.furniture.price
                }
            }))
        };
    }

    async findOne(where: FindOptionsWhere<Cart>, select: FindOptionsSelect<Cart> = {}, relations: FindOptionsRelations<Cart> = {}): Promise<Cart> {
        return await this.cartRepository.findOne({ where: where, select: select, relations: relations });
    }

    async update(id: number, data): Promise<any> {
        return this.cartRepository.update(id, data);
    }

    async delete(id: number): Promise<any> {
        console.log("Deleting cart : ", id);
        return this.cartRepository.delete(id);
    }
}
