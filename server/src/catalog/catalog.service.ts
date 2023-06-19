import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Catalog } from "./models/catalog.entity";

@Injectable()
export class CatalogService {
    constructor(
        @InjectRepository(Catalog) private readonly catalogRepository: Repository<Catalog>
    ) {
    }

    async all(): Promise<Catalog[]> {
        return this.catalogRepository.find();
    }

    async create(data): Promise<Catalog> {
        const article = await this.catalogRepository.save(data);
        console.log("Create catalog :", article);
        return article;
    }

    async findOne(condit): Promise<Catalog> {
        return await this.catalogRepository.findOne({ where: condit });
    }

    async update(id: number, data): Promise<any> {
        return this.catalogRepository.update(id, data);
    }

    async delete(id: number): Promise<any> {
        return this.catalogRepository.delete(id);
    }

    async deleteFromObjectId(object_id: string): Promise<any> {
        return this.catalogRepository.delete({ object_id: object_id });
    }

    async deleteArray(ids: number[]) {
        return this.catalogRepository.delete(ids);
    }

    async deleteAllObjectsFromCompany(company_id: number) {
        return this.catalogRepository.delete({ company: company_id });
    }

}