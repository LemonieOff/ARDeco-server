import { Injectable } from "@nestjs/common";
import Stripe from "stripe";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, UpdateResult } from "typeorm";
import { command} from "./models/command.entity";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { commandDto } from "./models/command.dto";



// TEST : sk_test_51NputjKvy7BFowS9fdbY0S1Zjp0HDC2WRZwp8vRzyHSAsUOSOxfzWNCF0nboryWA8Jp5ZJZVHWgPQI8orwTzYCZD00dGeVzihA
// TRUE : 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

@Injectable()
export class PaymentsService {
    private stripe;

    constructor(
        @InjectRepository(command)
        private readonly commandRepository: Repository<command>
    ) {
        this.stripe = new Stripe(
            "sk_test_51NputjKvy7BFowS9fdbY0S1Zjp0HDC2WRZwp8vRzyHSAsUOSOxfzWNCF0nboryWA8Jp5ZJZVHWgPQI8orwTzYCZD00dGeVzihA",
            {
                apiVersion: "2023-08-16"
            }
        );
        
    }

    createPayment(paymentRequestBody: commandDto): Promise<any> {
        let sumAmount = 0;
        //    paymentRequestBody.products.forEach((product) => {
        //      sumAmount = sumAmount + product.price * product.quantity;
        //    });
        return this.stripe.paymentIntents.create({
            amount: 4000,
            currency: "eur",
            payment_method_types: ["card"]
        });
    }

    async confirmPayment(paymentIntentId): Promise<any> {
        return await this.stripe.paymentIntents.confirm(paymentIntentId, {
            payment_method: "pm_card_visa"
        });
    }

    async all(): Promise<command[]> {
        return this.commandRepository.find();
    }

    async create(data): Promise<command> {
        const u = this.commandRepository.save(data);
        console.log("Create command :", await u);
        return u;
    }

    async findOne(condit): Promise<command> {
        return this.commandRepository.findOne({ where: condit });
    }

    async update(
        id: number,
        data: QueryPartialEntity<command>
    ): Promise<UpdateResult> {
        console.log("ID : ", id, ", DATA : ", data)
        return this.commandRepository.update(id, data);
    }

    async delete(id: number): Promise<any> {
        //return this.commandRepository.delete(id);
        console.log("Deleting command ", id);
        this.commandRepository
            .createQueryBuilder("command")
            .delete()
            .from(command)
            .where("id = id", { id: id })
            .execute();
    }
}
