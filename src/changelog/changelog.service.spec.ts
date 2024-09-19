import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Changelog } from "./models/changelog.entity";
import { ChangelogService } from "./changelog.service";

describe("ChangelogService", () => {
    let service: ChangelogService;
    let changelogRepository: Repository<Changelog>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChangelogService,
                {
                    provide: getRepositoryToken(Changelog),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<ChangelogService>(ChangelogService);
        changelogRepository = module.get<Repository<Changelog>>(getRepositoryToken(Changelog));
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("all", () => {
        it("should return all changelog entries ordered by date descending", async () => {
            const mockChangelogEntries = [
                { id: 1, version: "1.0.0", date: new Date("2023-10-27") },
                { id: 2, version: "1.1.0", date: new Date("2023-10-28") }
            ];
            jest.spyOn(changelogRepository, "find").mockResolvedValue(mockChangelogEntries as any);

            const result = await service.all();

            expect(changelogRepository.find).toHaveBeenCalledWith({ order: { date: "DESC" } });
            expect(result).toEqual(mockChangelogEntries);
        });
    });

    describe("latest", () => {
        it("should return the latest changelog entry", async () => {
            const mockLatestEntry = { id: 2, version: "1.1.0", date: new Date("2023-10-28") };
            jest.spyOn(changelogRepository, "findOne").mockResolvedValue(mockLatestEntry as any);

            const result = await service.latest();

            expect(changelogRepository.findOne).toHaveBeenCalledWith({
                order: { date: "DESC" },
                where: {}
            });
            expect(result).toEqual(mockLatestEntry);
        });

        it("should return null if no changelog entries exist", async () => {
            jest.spyOn(changelogRepository, "findOne").mockResolvedValue(null);

            const result = await service.latest();

            expect(result).toBeNull();
        });
    });

    describe("create", () => {
        it("should create a new changelog entry", async () => {
            const data = { version: "1.2.0", changelog: "Some changes" };
            const createdEntry = { id: 3, ...data, date: new Date() };
            jest.spyOn(changelogRepository, "save").mockResolvedValue(createdEntry as any);
            const consoleSpy = jest.spyOn(console, "log");

            const result = await service.create(data);

            expect(changelogRepository.save).toHaveBeenCalledWith(data);
            expect(consoleSpy).toHaveBeenCalledWith("Create changelog :", createdEntry);
            expect(result).toEqual(createdEntry);
        });
    });

    describe("findOne", () => {
        it("should find a changelog entry by condition", async () => {
            const condition = { id: 1 };
            const mockEntry = { id: 1, version: "1.0.0" };
            jest.spyOn(changelogRepository, "findOne").mockResolvedValue(mockEntry as any);

            const result = await service.findOne(condition);

            expect(changelogRepository.findOne).toHaveBeenCalledWith({ where: condition });
            expect(result).toEqual(mockEntry);
        });
    });

    describe("update", () => {
        it("should update a changelog entry and return the updated entry", async () => {
            const id = 1;
            const data = { version: "1.0.1" };
            const updatedEntry = { id: 1, version: "1.0.1", date: new Date() };
            jest.spyOn(changelogRepository, "update").mockResolvedValue({} as any);
            jest.spyOn(changelogRepository, "findOne").mockResolvedValue(updatedEntry as any);

            const result = await service.update(id, data);

            expect(changelogRepository.update).toHaveBeenCalledWith(id, data);
            expect(changelogRepository.findOne).toHaveBeenCalledWith({ where: { id: id } });
            expect(result).toEqual(updatedEntry);
        });
    });

    describe("delete", () => {
        it("should delete a changelog entry by ID", async () => {
            const id = 1;
            jest.spyOn(changelogRepository, "delete").mockResolvedValue({ affected: 1 } as any);
            const consoleSpy = jest.spyOn(console, "log");

            const result = await service.delete(id);

            expect(changelogRepository.delete).toHaveBeenCalledWith(id);
            expect(consoleSpy).toHaveBeenCalledWith("Deleting Changelog item", id);
            expect(result.affected).toBe(1);
        });
    });
});
