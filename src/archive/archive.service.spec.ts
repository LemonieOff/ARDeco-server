import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Catalog } from "../catalog/models/catalog.entity";
import { ArchiveService } from "./archive.service";
import { CatalogService } from "../catalog/catalog.service";

describe("ArchiveService", () => {
    let service: ArchiveService;
    let archiveRepository: Repository<Catalog>;
    let catalogService: CatalogService; // Mock CatalogService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArchiveService,
                {
                    provide: getRepositoryToken(Catalog),
                    useValue: {
                        save: jest.fn(),
                        findOne: jest.fn(),
                        find: jest.fn(),
                        delete: jest.fn()
                    }
                },
                {
                    provide: CatalogService, // Mock the CatalogService dependency
                    useValue: {
                        create: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<ArchiveService>(ArchiveService);
        archiveRepository = module.get<Repository<Catalog>>(
            getRepositoryToken(Catalog)
        );
        catalogService = module.get<CatalogService>(CatalogService); // Get the mock CatalogService
    });

    describe("create", () => {
        it("should create a new archive item", async () => {
            const data = {
                object_id: "OBJ_ID",
                company: 1,
                data: {}
            };
            const createdItem = new Catalog();
            Object.assign(createdItem, data, { id: 1 });

            jest.spyOn(archiveRepository, "save").mockResolvedValue(createdItem);

            const result = await service.archive(createdItem);
            expect(result).toEqual(createdItem);
        });
    });

    describe("findById", () => {
        it("should find an archive item by ID", async () => {
            const id = 1;
            const mockArchiveItem = new Catalog();
            jest.spyOn(archiveRepository, "findOne").mockResolvedValue(mockArchiveItem);

            const result = await service.findById(id);
            expect(archiveRepository.findOne).toHaveBeenCalledWith({ where: { id } });
            expect(result).toEqual(mockArchiveItem);
        });
    });

    describe("findByObjectId", () => {
        it("should find an archive item by object ID", async () => {
            const objectId = "OBJ_ID";
            const mockArchiveItem = new Catalog();
            jest.spyOn(archiveRepository, "findOne").mockResolvedValue(mockArchiveItem);

            const result = await service.findByObjectId(objectId);
            expect(archiveRepository.findOne).toHaveBeenCalledWith({
                where: { object_id: objectId }
            });
            expect(result).toEqual(mockArchiveItem);
        });
    });

    describe("findAllObjectsFromCompany", () => {
        it("should find all archive items for a company", async () => {
            const companyId = 1;
            const mockArchiveItems = [new Catalog(), new Catalog()];
            jest.spyOn(archiveRepository, "find").mockResolvedValue(mockArchiveItems);

            const result = await service.findAllForCompany(companyId);
            expect(archiveRepository.find).toHaveBeenCalledWith({
                where: { company: companyId },
            });
            expect(result).toEqual(mockArchiveItems);
        });
    });

    describe("deleteAllObjectsFromCompany", () => {
        it("should delete all archive items for a company and return a backup", async () => {
            const companyId = 1;
            const mockArchiveItems = [new Catalog(), new Catalog()];
            jest.spyOn(archiveRepository, "find").mockResolvedValue(mockArchiveItems);
            jest.spyOn(archiveRepository, "delete").mockResolvedValue({ affected: 2 } as any);

            const result = await service.deleteAllForCompany(companyId);
            expect(archiveRepository.find).toHaveBeenCalledWith({
                where: { company: companyId },
            });
            expect(archiveRepository.delete).toHaveBeenCalledWith({
                company: companyId,
            });
            expect(result).toEqual(mockArchiveItems); // Backup returned
        });
    });

    describe("deleteObjectFromCompany", () => {
        it("should delete a specific archive item for a company and return a backup", async () => {
            const companyId = 4;
            const id = 1;
            const mockArchiveItem = new Catalog();
            jest.spyOn(archiveRepository, "findOne").mockResolvedValue(mockArchiveItem);
            jest.spyOn(archiveRepository, "delete").mockResolvedValue({ affected: 1 } as any);

            const result = await service.deleteObjectForCompany(companyId, id);
            expect(archiveRepository.findOne).toHaveBeenCalledWith({
                where: { id: id },
            });
            expect(archiveRepository.delete).toHaveBeenCalledWith({
                company: companyId,
                id: id,
            });
            expect(result).toEqual(mockArchiveItem); // Backup returned
        });
    });

    describe("restore", () => {
        it("should restore an object from the archive", async () => {
            const objectId = 1;
            const mockArchiveItem = new Catalog();
            mockArchiveItem.id = 1;
            mockArchiveItem.depth = 5;
            mockArchiveItem.height = 2;
            mockArchiveItem.width = 48;
            const mockCatalogItem = new Catalog();
            jest.spyOn(archiveRepository, "findOne").mockResolvedValue(mockArchiveItem);
            jest.spyOn(archiveRepository, "delete").mockResolvedValue({ affected: 1 } as any);
            jest.spyOn(catalogService, "create").mockResolvedValue(mockCatalogItem);

            const result = await service.restore(mockArchiveItem);
            expect(archiveRepository.findOne).toHaveBeenCalledWith({
                where: { id: objectId }
            });
            expect(archiveRepository.delete).toHaveBeenCalledWith(mockArchiveItem.id);
            expect(catalogService.create).toHaveBeenCalledWith(mockArchiveItem);
            expect(result).toEqual(mockCatalogItem);
        });
    });
});
