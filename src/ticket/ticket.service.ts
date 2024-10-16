import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { Ticket } from "./models/ticket.entity";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class TicketService {
    constructor(
        @InjectRepository(Ticket)
        private readonly TicketRepository: Repository<Ticket>
    ) {
    }

    async all(): Promise<Ticket[]> {
        return this.TicketRepository.find();
    }

    async allForUser(userId: number): Promise<Ticket[]> {
        return this.TicketRepository.find({
            where: {
                user_id: userId,
                status: Not("deleted")
            },
            select: ["id", "title", "status", "description"]
        });
    }

    async create(data): Promise<Ticket> {
        const u = this.TicketRepository.save(data);
        console.log("Create Ticket :", await u);
        return u;
    }

    async findOne(condit): Promise<Ticket> {
        return this.TicketRepository.findOne({ where: condit });
    }

    async update(
        id: number,
        data: QueryPartialEntity<Ticket>
    ): Promise<Ticket> {
        await this.TicketRepository.update(id, data);
        return await this.findOne({ id: id });
    }

    async delete(id: number): Promise<any> {
        console.log("Deleting Ticket item", id);
        return this.TicketRepository.createQueryBuilder("ticket")
            .delete()
            .from(Ticket)
            .where("id = id", { id: id })
            .execute();
    }
}
