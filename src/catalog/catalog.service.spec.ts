import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { FindOptionsWhere, In, LessThanOrEqual, Repository } from "typeorm";
import { CatalogService } from "./catalog.service";
import { Catalog } from "./models/catalog.entity";
import { ArchiveService } from "../archive/archive.service";
import { CatalogFilterDto } from "./dtos/catalog-filter.dto";
import { CatalogCreateDto } from "./dtos/catalog-create.dto";
import { CatalogColors } from "./models/catalog_colors.entity";
import { CatalogRooms } from "./models/catalog_rooms.entity";
import { CatalogStyles } from "./models/catalog_styles.entity";
import { CatalogResponseDto } from "./dtos/catalog-response.dto";
import { CatalogUpdateDto } from "./dtos/catalog-update.dto";

describe("CatalogService", () => {
    let service: CatalogService;
    let catalogRepository: Repository<Catalog>;
    let catalogColorsRepository: Repository<CatalogColors>;
    let catalogStylesRepository: Repository<CatalogStyles>;
    let catalogRoomsRepository: Repository<CatalogRooms>;
    let archiveService: ArchiveService;

    const mockCatalogItem: Catalog = {
        id: 1,
        name: "Test Furniture",
        price: 100,
        width: 50,
        height: 60,
        depth: 40,
        styles: [{
            id: 1, furniture_id: 1, style: "modern",
            furniture: new Catalog
        }],
        rooms: [{
            id: 1, furniture_id: 1, room: "living_room",
            furniture: new Catalog
        }],
        colors: [{
            id: 1, furniture_id: 1, model_id: 1, color: "red",
            furniture: new Catalog
        }],
        object_id: "test-furniture-1",
        active: true,
        archived: false,
        company: 1,
        company_name: "Test Company",
        favorites: []
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CatalogService,
                {
                    provide: getRepositoryToken(Catalog),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        findBy: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn()
                    }
                },
                {
                    provide: getRepositoryToken(CatalogColors),
                    useValue: {
                        delete: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn()
                    }
                },
                {
                    provide: getRepositoryToken(CatalogStyles),
                    useValue: {
                        delete: jest.fn(),
                        save: jest.fn()
                    }
                },
                {
                    provide: getRepositoryToken(CatalogRooms),
                    useValue: {
                        delete: jest.fn(),
                        save: jest.fn()
                    }
                },
                {
                    provide: ArchiveService,
                    useValue: {
                        archive: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<CatalogService>(CatalogService);
        catalogRepository = module.get<Repository<Catalog>>(getRepositoryToken(Catalog));
        catalogColorsRepository = module.get<Repository<CatalogColors>>(getRepositoryToken(CatalogColors));
        catalogStylesRepository = module.get<Repository<CatalogStyles>>(getRepositoryToken(CatalogStyles));
        catalogRoomsRepository = module.get<Repository<CatalogRooms>>(getRepositoryToken(CatalogRooms));
        archiveService = module.get<ArchiveService>(ArchiveService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("all", () => {
        it("should return all catalog items (active and inactive)", async () => {
            const mockCatalogItems = [mockCatalogItem, { ...mockCatalogItem, id: 2, active: false }];
            jest.spyOn(catalogRepository, "find").mockResolvedValueOnce(mockCatalogItems as any);

            const result = await service.all();

            expect(catalogRepository.find).toHaveBeenCalledWith({
                relations: { colors: true, rooms: true, styles: true },
                select: {
                    active: true, colors: { color: true, model_id: true }, company: true,
                    company_name: true, depth: true, height: true, id: true, name: true,
                    object_id: true, price: true, rooms: { room: true }, styles: { style: true },
                    width: true, archived: true
                },
                where: { archived: false }
            });
            expect(result).toEqual(mockCatalogItems.map(item => expect.objectContaining({
                id: item.id,
                name: item.name,
                colors: [{ color: "red", model_id: 1 }],
                styles: ["modern"],
                rooms: ["living_room"]
            })));
        });

        it("should return only active catalog items", async () => {
            const mockCatalogItems = [mockCatalogItem, { ...mockCatalogItem, id: 2, active: false }];
            jest.spyOn(catalogRepository, "find").mockResolvedValueOnce(mockCatalogItems as any);

            const result = await service.all(true); // activeOnly = true

            expect(catalogRepository.find).toHaveBeenCalledWith({
                relations: { colors: true, rooms: true, styles: true },
                select: {
                    active: true, colors: { color: true, model_id: true }, company: true,
                    company_name: true, depth: true, height: true, id: true, name: true,
                    object_id: true, price: true, rooms: { room: true }, styles: { style: true },
                    width: true, archived: true
                },
                where: { archived: false, active: true }
            });
            expect(result.length).toBe(2); // Check if both active and inactive are returned
        });
    });

    describe("filter", () => {
        it("should filter catalog items based on criteria", async () => {
            const filter: CatalogFilterDto = { price: 200, colors: ["red", "blue"], styles: ["modern"], rooms: ["living_room"] };
            jest.spyOn(catalogRepository, "find").mockResolvedValueOnce([mockCatalogItem] as any);

            const result = await service.filter(filter);

            expect(catalogRepository.find).toHaveBeenCalledWith({
                relations: { colors: true, rooms: true, styles: true },
                select: {
                    active: true, colors: { color: true, model_id: true }, company: true,
                    company_name: true, depth: true, height: true, id: true, name: true,
                    object_id: true, price: true, rooms: { room: true }, styles: { style: true },
                    width: true, archived: true
                },
                where: {
                    price: LessThanOrEqual(filter.price),
                    colors: { color: In(filter.colors) },
                    styles: { style: In(filter.styles) },
                    rooms: { room: In(filter.rooms) },
                    archived: false,
                    active: true
                }
            });
            expect(result).toEqual([expect.objectContaining({
                id: mockCatalogItem.id,
                name: mockCatalogItem.name,
                colors: [{ color: "red", model_id: 1 }],
                styles: ["modern"],
                rooms: ["living_room"]
            })]);
        });

        it("should filter catalog items based on criteria (admin)", async () => {
            const filter: CatalogFilterDto = { price: 200, colors: ["red", "blue"], styles: ["modern"], rooms: ["living_room"] };
            jest.spyOn(catalogRepository, "find").mockResolvedValueOnce([mockCatalogItem] as any);

            const result = await service.filter(filter, true);

            expect(catalogRepository.find).toHaveBeenCalledWith({
                relations: { colors: true, rooms: true, styles: true },
                select: {
                    active: true, colors: { color: true, model_id: true }, company: true,
                    company_name: true, depth: true, height: true, id: true, name: true,
                    object_id: true, price: true, rooms: { room: true }, styles: { style: true },
                    width: true, archived: true
                },
                where: {
                    price: LessThanOrEqual(filter.price),
                    colors: { color: In(filter.colors) },
                    styles: { style: In(filter.styles) },
                    rooms: { room: In(filter.rooms) }
                }
            });
            expect(result).toEqual([expect.objectContaining({
                id: mockCatalogItem.id,
                name: mockCatalogItem.name,
                colors: [{ color: "red", model_id: 1 }],
                styles: ["modern"],
                rooms: ["living_room"]
            })]);
        });
    });

    describe("create", () => {
        it("should create a new catalog item", async () => {
            const dto: CatalogCreateDto = {
                name: "New Furniture",
                price: 150,
                width: 75,
                height: 80,
                depth: 35,
                colors: [{ color: "blue", model_id: 2 }, { color: "green", model_id: 3 }],
                rooms: ["bedroom", "office"],
                styles: ["contemporary", "minimalist"],
                company_name: "New Company",
                object_id: "new-furniture-1"
            } as CatalogCreateDto;

            const createdItem = { ...mockCatalogItem, ...dto, company: 1 };
            jest.spyOn(catalogRepository, "save").mockResolvedValueOnce(createdItem as any);

            const result = await service.create(dto);

            // Expect the relations arrays to be populated with objects
            const expectedColors = dto.colors.map((c: any) => expect.objectContaining({ color: c.color, model_id: c.model_id, furniture: expect.anything() }));
            const expectedRooms = dto.rooms.map(r => expect.objectContaining({ room: r, furniture: expect.anything() }));
            const expectedStyles = dto.styles.map(s => expect.objectContaining({ style: s, furniture: expect.anything() }));

            expect(catalogRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                ...dto,
                company: dto.company,
                colors: expect.arrayContaining(expectedColors),
                rooms: expect.arrayContaining(expectedRooms),
                styles: expect.arrayContaining(expectedStyles)
            }));
            expect(result).toEqual(createdItem);
        });
    });

    describe("findOne", () => {
        it("should find a catalog item by condition", async () => {
            const where: FindOptionsWhere<Catalog> = { id: 1 };
            jest.spyOn(catalogRepository, "findOne").mockResolvedValueOnce(mockCatalogItem as any);

            const result = await service.findOne(where);

            expect(catalogRepository.findOne).toHaveBeenCalledWith({
                select: {
                    colors: true,
                    rooms: true,
                    styles: true
                },
                relations: {
                    colors: true,
                    rooms: true,
                    styles: true
                },
                where: { ...where, archived: false }
            });
            expect(result).toEqual(mockCatalogItem);
        });
    });

    describe("findOneById", () => {
        it("should return catalog item by ID", async () => {
            const id = 1;
            jest.spyOn(catalogRepository, "findOne").mockResolvedValue(mockCatalogItem as any);

            const result = await service.findOneById(id);

            expect(catalogRepository.findOne).toHaveBeenCalledWith({
                select: { colors: true, rooms: true, styles: true },
                relations: { colors: true, rooms: true, styles: true },
                where: { id, archived: false }
            });
            expect(result).toEqual({
                ...mockCatalogItem,
                colors: [{ color: "red", model_id: 1 }],
                styles: ["modern"],
                rooms: ["living_room"]
            });
        });

        it("should return null if not found", async () => {
            const id = 2; // Non-existent ID
            jest.spyOn(catalogRepository, "findOne").mockResolvedValue(null);

            const result = await service.findOneById(id);

            expect(result).toBeNull();
        });
    });

    describe("findByCompany", () => {
        it("should find catalog items by company ID", async () => {
            const companyId = 1;
            const mockItems = [mockCatalogItem, { ...mockCatalogItem, id: 2 }];
            jest.spyOn(catalogRepository, "find").mockResolvedValue(mockItems as any);

            const result = await service.findByCompany(companyId);

            expect(catalogRepository.find).toHaveBeenCalledWith({
                relations: { colors: true, rooms: true, styles: true },
                select: {
                    active: true, colors: { color: true, model_id: true }, company: true,
                    company_name: true, depth: true, height: true, id: true, name: true,
                    object_id: true, price: true, rooms: { room: true }, styles: { style: true },
                    width: true, archived: true
                },
                where: { company: companyId, archived: false }
            });
            expect(result).toEqual(mockItems.map(item => expect.objectContaining({
                id: item.id,
                name: item.name,
                colors: [{ color: "red", model_id: 1 }],
                styles: ["modern"],
                rooms: ["living_room"]
            })));
        });
    });

    describe("update", () => {
        it("should update a catalog item", async () => {
            const id = 1;
            const dto: CatalogUpdateDto = {
                name: "Updated name",
                width: 100,
                colors: [{ color: "red", model_id: 1 }, { color: "green", model_id: 2 }],
                styles: ["modern", "classic"],
                rooms: ["living_room", "dining_room"]
            } as CatalogUpdateDto;

            const updatedItem = { ...mockCatalogItem, ...dto };
            jest.spyOn(catalogRepository, "save").mockResolvedValue(updatedItem as any);
            jest.spyOn(catalogColorsRepository, "delete").mockResolvedValue({} as any);
            jest.spyOn(catalogStylesRepository, "delete").mockResolvedValue({} as any);
            jest.spyOn(catalogRoomsRepository, "delete").mockResolvedValue({} as any);
            jest.spyOn(catalogColorsRepository, "save").mockResolvedValue(dto.colors as any);
            jest.spyOn(catalogStylesRepository, "save").mockResolvedValue(dto.styles as any);
            jest.spyOn(catalogRoomsRepository, "save").mockResolvedValue(dto.rooms as any);

            const result = await service.update(mockCatalogItem, dto);

            expect(catalogRepository.save).toHaveBeenCalledWith(expect.objectContaining(updatedItem));
            expect(result).toEqual({
                ...updatedItem,
                colors: dto.colors.map((c: { color: any; model_id: any; }) => ({ color: c.color, model_id: c.model_id })),
                styles: dto.styles,
                rooms: dto.rooms
            });
        });
    });


    describe("archive", () => {
        it("should archive a catalog item", async () => {
            const id = 1;
            const archivedItem: CatalogResponseDto = { ...mockCatalogItem, archived: true } as unknown as CatalogResponseDto;
            jest.spyOn(service, "findOne").mockResolvedValueOnce(mockCatalogItem as any);
            jest.spyOn(archiveService, "archive").mockResolvedValueOnce(archivedItem as any);

            const result = await service.archive(id);

            expect(service.findOne).toHaveBeenCalledWith({ id });
            expect(archiveService.archive).toHaveBeenCalledWith(mockCatalogItem);
            expect(result).toEqual(archivedItem);
        });
    });

    describe("archiveItem", () => {
        it("should archive a catalog item", async () => {
            const archivedItem = { ...mockCatalogItem, archived: true } as unknown as CatalogResponseDto;
            jest.spyOn(archiveService, "archive").mockResolvedValueOnce(archivedItem as any);

            const result = await service.archiveItem(mockCatalogItem);

            expect(archiveService.archive).toHaveBeenCalledWith(mockCatalogItem);
            expect(result).toEqual(archivedItem);
        });
    });

    describe("archiveArray", () => {
        it("should archive an array of catalog items", async () => {
            const ids = [1, 2];
            const mockItems = [mockCatalogItem, { ...mockCatalogItem, id: 2 }];
            const archivedItems = mockItems.map(item => ({ ...item, archived: true } as unknown as CatalogResponseDto));
            jest.spyOn(catalogRepository, "findBy").mockResolvedValueOnce(mockItems as any);
            jest.spyOn(service, "archiveItem").mockResolvedValueOnce(archivedItems[0] as any).mockResolvedValueOnce(archivedItems[1] as any);

            const result = await service.archiveArray(ids);

            expect(catalogRepository.findBy).toHaveBeenCalledWith({ id: In(ids) });
            expect(service.archiveItem).toHaveBeenCalledTimes(2);
            expect(result).toEqual(archivedItems);
        });
    });

    describe("archiveAllForCompany", () => {
        it("should archive all items for a company", async () => {
            const companyId = 1;
            const mockItems = [mockCatalogItem, { ...mockCatalogItem, id: 2 }];
            const archivedItems = mockItems.map(item => ({ ...item, archived: true } as unknown as CatalogResponseDto));
            jest.spyOn(catalogRepository, "find").mockResolvedValueOnce(mockItems as any);
            const archiveSpy = jest.spyOn(service, "archiveItem")
                .mockResolvedValueOnce(archivedItems[0] as any)
                .mockResolvedValueOnce(archivedItems[1] as any);

            const result = await service.archiveAllForCompany(companyId);

            expect(catalogRepository.find).toHaveBeenCalledWith({
                where: { company: companyId, archived: false }
            });
            expect(archiveSpy).toHaveBeenCalledTimes(2);
            expect(result).toEqual(archivedItems);
        });
    });

    describe("findColor", () => {
        it("should find a color by furniture ID and model ID", async () => {
            const furnitureId = 1;
            const modelId = 1;
            const mockColor = { id: 1, furniture_id: furnitureId, model_id: modelId, color: "red" } as CatalogColors;
            jest.spyOn(catalogColorsRepository, "findOne").mockResolvedValue(mockColor as any);

            const result = await service.findColor(furnitureId, modelId);

            expect(catalogColorsRepository.findOne).toHaveBeenCalledWith({
                relations: { furniture: true },
                select: {
                    id: true, furniture_id: true, model_id: true, color: true,
                    furniture: { id: true, archived: true, company: true, active: true, price: true }
                },
                where: {
                    furniture_id: furnitureId,
                    model_id: modelId,
                    furniture: { active: true, archived: false }
                }
            });
            expect(result).toEqual(mockColor);
        });
    });

    describe("isExistingModelForFurniture", () => {
        it("should return true if model exists for furniture", async () => {
            const furnitureId = 1;
            const modelId = 1;
            jest.spyOn(service, "findColor").mockResolvedValue({} as CatalogColors);

            const result = await service.isExistingModelForFurniture(furnitureId, modelId);

            expect(service.findColor).toHaveBeenCalledWith(furnitureId, modelId);
            expect(result).toBe(true);
        });

        it("should return false if model does not exist for furniture", async () => {
            const furnitureId = 1;
            const modelId = 2; // Different model ID
            jest.spyOn(service, "findColor").mockResolvedValue(null);

            const result = await service.isExistingModelForFurniture(furnitureId, modelId);

            expect(service.findColor).toHaveBeenCalledWith(furnitureId, modelId);
            expect(result).toBe(false);
        });
    });
});
