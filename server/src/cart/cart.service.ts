import { Injectable, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cart } from "./models/cart.entity";
import { AuthGuard } from "src/auth/auth.guard";

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(Cart)
        private readonly cartRepository: Repository<Cart>
    ) {}

    async all(): Promise<Cart[]> {
        return this.cartRepository.find();
    }

    @UseGuards(AuthGuard)
    async create(data): Promise<Cart> {
        const article = await this.cartRepository.save(data);
        console.log("Create catalog :", article);
        return article;
    }

    async findOne(condit): Promise<Cart> {
        return await this.cartRepository.findOne({ where: condit });
    }

    @UseGuards(AuthGuard)
    async update(id: number, data): Promise<any> {
        return this.cartRepository.update(id, data);
    }

    async delete(id: number): Promise<any> {
        console.log("Deleting cart : ", id);
        this.cartRepository
            .createQueryBuilder("cart")
            .delete()
            .from(Cart)
            .where("id = id", { id: id })
            .execute();
        return this.cartRepository.delete(id);
    }
}
