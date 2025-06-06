import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, FindOptionsWhere, In, LessThanOrEqual, Repository } from "typeorm";
import { Catalog } from "./models/catalog.entity";
import { ArchiveService } from "../archive/archive.service";
import { CatalogFilterDto } from "./dtos/catalog-filter.dto";
import { CatalogCreateDto } from "./dtos/catalog-create.dto";
import { CatalogColors } from "./models/catalog_colors.entity";
import { CatalogRooms } from "./models/catalog_rooms.entity";
import { CatalogStyles } from "./models/catalog_styles.entity";
import { CatalogResponseDto } from "./dtos/catalog-response.dto";
import { CatalogUpdateDto } from "./dtos/catalog-update.dto";
import { ColorWithModelDto } from "./dtos/catalog-color-model.dto";

const selectRelations: FindManyOptions<Catalog> = {
    relations: {
        colors: true,
        rooms: true,
        styles: true
    },
    select: {
        id: true,
        name: true,
        object_id: true,
        company: true,
        company_name: true,
        price: true,
        width: true,
        height: true,
        depth: true,
        active: true,
        archived: true,
        colors: {
            color: true,
            model_id: true
        },
        styles: {
            style: true
        },
        rooms: {
            room: true
        }
    }
};

@Injectable()
export class CatalogService {
    constructor(
        @InjectRepository(Catalog)
        private readonly catalogRepository: Repository<Catalog>,
        @InjectRepository(CatalogColors)
        private readonly catalogColorsRepository: Repository<CatalogColors>,
        @InjectRepository(CatalogStyles)
        private readonly catalogStylesRepository: Repository<CatalogStyles>,
        @InjectRepository(CatalogRooms)
        private readonly catalogRoomsRepository: Repository<CatalogRooms>,
        private readonly archiveService: ArchiveService
    ) {
    }

    async all(activeOnly: boolean = false): Promise<CatalogResponseDto[]> {
        const active = activeOnly ? { active: true } : {};
        const catalog = await this.catalogRepository.find({
            where: { archived: false, ...active },
            ...selectRelations
        });

        return catalog.map(catalog => ({
            ...catalog,
            colors: catalog.colors.map(color => ({
                color: color.color,
                model_id: color.model_id
            })),
            styles: catalog.styles.map(style => style.style),
            rooms: catalog.rooms.map(room => room.room)
        }));
    }

    async filter(query: CatalogFilterDto, isAdmin: boolean = false): Promise<CatalogResponseDto[]> {
        const where: FindOptionsWhere<Catalog> = {};
        if (query.price) {
            console.log("Price");
            where.price = LessThanOrEqual(query.price);
        }
        if (query.colors) {
            console.log("Colors");
            where.colors = {
                color: In(query.colors)
            };
        }
        if (query.styles) {
            console.log("Styles");
            where.styles = {
                style: In(query.styles)
            };
        }
        if (query.rooms) {
            console.log("Rooms");
            where.rooms = {
                room: In(query.rooms)
            };
        }

        console.log("");
        let catalog: Catalog[];
        if (!isAdmin) {
            catalog = await this.catalogRepository.find({
                where: {
                    ...where,
                    archived: false,
                    active: true
                },
                ...selectRelations
            });
        } else {
            catalog = await this.catalogRepository.find({
                where: where,
                ...selectRelations
            });
        }

        return catalog.map(catalog => ({
            ...catalog,
            colors: catalog.colors.map(color => ({
                color: color.color,
                model_id: color.model_id
            })),
            styles: catalog.styles.map(style => style.style),
            rooms: catalog.rooms.map(room => room.room)
        }));
    }

    async create(data: CatalogCreateDto): Promise<Catalog> {
        const object = new Catalog();
        object.name = data.name;
        object.width = data.width;
        object.height = data.height;
        object.depth = data.depth;
        object.company = data.company;
        object.company_name = data.company_name;
        object.price = data.price;
        object.object_id = data.object_id;

        let colors: CatalogColors[] = [];
        for (const colorString of data.colors) {
            const color: CatalogColors = new CatalogColors();
            color.color = typeof colorString === "string" ? colorString : colorString.color;
            color.furniture = object;
            if (typeof colorString === "object") {
                color.model_id = colorString.model_id;
            }
            colors.push(color);
        }
        object.colors = colors;

        let rooms: CatalogRooms[] = [];
        for (const roomString of data.rooms) {
            const room: CatalogRooms = new CatalogRooms();
            room.room = roomString;
            room.furniture = object;
            rooms.push(room);
        }
        object.rooms = rooms;

        let styles: CatalogStyles[] = [];
        for (const styleString of data.styles) {
            const style: CatalogStyles = new CatalogStyles();
            style.style = styleString;
            style.furniture = object;
            styles.push(style);
        }
        object.styles = styles;

        return this.catalogRepository.save(object);
    }

    async findOne(where: FindOptionsWhere<Catalog>): Promise<Catalog> {
        return await this.catalogRepository.findOne({
            where: {
                ...where,
                archived: false
            },
            ...selectRelations,
            // Fix a bug where if only a specific field is required (as it is in the constant),
            // only the first related record of each type will be returned
            // instead of all related entities
            select: {
                colors: true,
                styles: true,
                rooms: true
            }
        });
    }

    async findOneById(id: number): Promise<CatalogResponseDto> {
        const catalog = await this.catalogRepository.findOne({
            where: {
                id: id,
                archived: false
            },
            ...selectRelations,
            // Fix a bug where if only a specific field is required (as it is in the constant),
            // only the first related record of each type will be returned
            // instead of all related entities
            select: {
                colors: true,
                styles: true,
                rooms: true
            }
        });

        if (!catalog) {
            return null;
        }

        return {
            ...catalog,
            colors: catalog.colors.map(color => ({
                color: color.color,
                model_id: color.model_id
            })),
            styles: catalog.styles.map(style => style.style),
            rooms: catalog.rooms.map(room => room.room)
        };
    }

    async findByCompany(company_id: number): Promise<CatalogResponseDto[]> {
        const catalog = await this.catalogRepository.find({
            where: {
                company: company_id,
                archived: false
            },
            ...selectRelations
        });

        return catalog.map(catalog => ({
            ...catalog,
            colors: catalog.colors.map(color => ({
                color: color.color,
                model_id: color.model_id
            })),
            styles: catalog.styles.map(style => style.style),
            rooms: catalog.rooms.map(room => room.room)
        }));
    }

    async update(object: Catalog, data: CatalogUpdateDto): Promise<CatalogResponseDto> {
        if (data.name && data.name !== object.name)
            object.name = data.name;
        if (data.width && data.width !== object.width)
            object.width = data.width;
        if (data.height && data.height !== object.height)
            object.height = data.height;
        if (data.depth && data.depth !== object.depth)
            object.depth = data.depth;
        if (data.company_name && data.company_name !== object.company_name)
            object.company_name = data.company_name;
        if (data.price && data.price !== object.price)
            object.price = data.price;
        if (data.object_id && data.object_id !== object.object_id)
            object.object_id = data.object_id;
        if (data.active !== undefined && data.active !== object.active)
            object.active = data.active;

        if (data.colors && data.colors.length > 0) {
            const oldItems = object.colors;
            const newItems: string[] = typeof data.colors[0] === "string"
                ? (data.colors as string[])
                : (data.colors as ColorWithModelDto[]).map(it => it.color);
            const existingItems = oldItems.map(item => item.color);

            const itemsToPreserve = oldItems.filter(item => newItems.includes(item.color));
            if (typeof data.colors[0] === "object") {
                itemsToPreserve.forEach(item => {
                    item.model_id = (data.colors as ColorWithModelDto[]).find(it => it.color === item.color).model_id;
                });
            }

            const itemsToRemove = existingItems.filter(item => !newItems.includes(item));
            await this.catalogColorsRepository.delete({
                color: In(itemsToRemove),
                furniture_id: object.id
            });

            const itemsToAdd = newItems.filter(item => !existingItems.includes(item));
            const newEntities = itemsToAdd.map(item => {
                const catalog = new CatalogColors();
                catalog.furniture_id = object.id;
                catalog.color = item;
                if (typeof data.colors[0] === "object") {
                    catalog.model_id = (data.colors as ColorWithModelDto[]).find(it => it.color === item).model_id;
                }
                return catalog;
            });
            await this.catalogColorsRepository.save(newEntities);

            object.colors = [...itemsToPreserve, ...newEntities];
        }

        if (data.styles && data.styles.length > 0) {
            const oldItems = object.styles;
            const newItems = data.styles;
            const existingItems = oldItems.map(item => item.style);

            const itemsToPreserve = oldItems.filter(item => newItems.includes(item.style));
            const itemsToRemove = existingItems.filter(item => !newItems.includes(item));
            await this.catalogStylesRepository.delete({
                style: In(itemsToRemove),
                furniture_id: object.id
            });

            const itemsToAdd = newItems.filter(item => !existingItems.includes(item));
            const newEntities = itemsToAdd.map(item => {
                const catalog = new CatalogStyles();
                catalog.furniture_id = object.id;
                catalog.style = item;
                return catalog;
            });
            await this.catalogStylesRepository.save(newEntities);

            object.styles = [...itemsToPreserve, ...newEntities];
        }

        if (data.rooms && data.rooms.length > 0) {
            const oldItems = object.rooms;
            const newItems = data.rooms;
            const existingItems = oldItems.map(item => item.room);

            const itemsToPreserve = oldItems.filter(item => newItems.includes(item.room));
            const itemsToRemove = existingItems.filter(item => !newItems.includes(item));
            await this.catalogRoomsRepository.delete({
                room: In(itemsToRemove),
                furniture_id: object.id
            });

            const itemsToAdd = newItems.filter(item => !existingItems.includes(item));
            const newEntities = itemsToAdd.map(item => {
                const catalog = new CatalogRooms();
                catalog.furniture_id = object.id;
                catalog.room = item;
                return catalog;
            });
            await this.catalogRoomsRepository.save(newEntities);

            object.rooms = [...itemsToPreserve, ...newEntities];
        }

        const result = await this.catalogRepository.save(object);

        return {
            ...result,
            colors: result.colors.map(color => ({
                color: color.color,
                model_id: color.model_id
            })),
            styles: result.styles.map(style => style.style),
            rooms: result.rooms.map(room => room.room)
        };
    }

    /*async deleteFromObjectId(object_id: string): Promise<any> {
        return this.catalogRepository.delete({ object_id: object_id });
    }*/

    async archive(id: number): Promise<CatalogResponseDto> {
        const item = await this.findOne({ id: id });
        return this.archiveService.archive(item);
    }

    async archiveItem(item: Catalog): Promise<CatalogResponseDto> {
        return this.archiveService.archive(item);
    }

    async archiveArray(ids: number[]): Promise<CatalogResponseDto[]> {
        const itemList = await this.catalogRepository.findBy({ id: In(ids) });
        let archivedList: CatalogResponseDto[] = [];

        // Archive each furniture
        for (const item of itemList) {
            archivedList.push(await this.archiveItem(item));
        }

        return archivedList;
    }

    async archiveAllForCompany(company_id: number): Promise<CatalogResponseDto[]> {
        const itemList = await this.catalogRepository.find({
            where: {
                company: company_id,
                archived: false
            }
        });
        let archivedList: CatalogResponseDto[] = [];

        // Archive each furniture
        for (const item of itemList) {
            archivedList.push(await this.archiveItem(item));
        }

        return archivedList;
    }

    /**
     * Find a row in the {@link CatalogColors} table.
     *
     * @param furniture_id - The main id of a {@link Catalog} entity
     * @param model_id - The model id associated to {@link furniture_id} in a {@link CatalogColors} entity
     * @param includeInactive - Also search in inactive objects
     * @param includeArchive - Also search in archived objects
     *  * When {@link includeInactive} is set to false, it will only search for archived objects with the "activated" state
     *  * To search in all archived objects, both parameters needs to be set to true
     *
     */
    async findColor(
        furniture_id: number,
        model_id: number,
        includeInactive: boolean = false,
        includeArchive: boolean = false
    ): Promise<CatalogColors> {
        const where: FindOptionsWhere<CatalogColors> = {
            furniture_id: furniture_id,
            model_id: model_id,
            furniture: {
                active: true,
                archived: false
            }
        };

        if (includeInactive) {
            delete (where.furniture as FindOptionsWhere<Catalog>).active;
        }

        if (includeArchive) {
            delete (where.furniture as FindOptionsWhere<Catalog>).archived;
        }

        return await this.catalogColorsRepository.findOne({
            relations: {
                furniture: true
            },
            select: {
                id: true,
                furniture_id: true,
                model_id: true,
                color: true,
                furniture: {
                    id: true,
                    archived: true,
                    company: true,
                    active: true,
                    price: true
                }
            },
            where: where
        });
    }

    async isExistingModelForFurniture(furniture_id: number, model_id: number): Promise<boolean> {
        return await this.findColor(furniture_id, model_id) !== null;
    }
}
