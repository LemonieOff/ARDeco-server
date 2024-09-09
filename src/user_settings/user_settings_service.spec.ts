import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { FindOptionsSelect, Repository } from "typeorm";
import { UserSettings } from "./models/user_settings.entity";
import { UserSettingsService } from "./user_settings_service";

describe("UserSettingsService", () => {
    let service: UserSettingsService;
    let userRepository: Repository<UserSettings>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserSettingsService,
                {
                    provide: getRepositoryToken(UserSettings),
                    useValue: {
                        find: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn(),
                        createQueryBuilder: jest.fn(() => ({
                            delete: jest.fn().mockReturnThis(),
                            from: jest.fn().mockReturnThis(),
                            where: jest.fn().mockReturnThis(),
                            execute: jest.fn()
                        })),
                        delete: jest.fn(),
                    }
                }
            ]
        }).compile();

        service = module.get<UserSettingsService>(UserSettingsService);
        userRepository = module.get<Repository<UserSettings>>(
            getRepositoryToken(UserSettings)
        );
    });

    describe("all", () => {
        it("should return all user settings", async () => {
            const mockSettings = [new UserSettings(), new UserSettings()];
            jest.spyOn(userRepository, "find").mockResolvedValue(mockSettings);

            const result = await service.all();
            expect(result).toEqual(mockSettings);
        });
    });

    describe("create", () => {
        it("should create new user settings", async () => {
            const data = {
                theme: "dark",
                language: "en"
            };
            const createdSettings = { id: 1, ...data };
            jest.spyOn(userRepository, "save").mockResolvedValue(createdSettings as any);

            const result = await service.create(data);
            expect(result).toEqual(createdSettings);
        });
    });

    describe("findOne", () => {
        it("should find user settings by condition without select", async () => {
            const condition = { id: 1 };
            const mockSettings = new UserSettings();
            jest.spyOn(userRepository, "findOne").mockResolvedValue(mockSettings);

            const result = await service.findOne(condition);
            expect(result).toEqual(mockSettings);
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: condition,
                loadRelationIds: true,
                relations: {
                    user: true
                },
                loadEagerRelations: false
            });
        });

        it("should find user settings by condition with select", async () => {
            const condition = { id: 1 };
            const select: FindOptionsSelect<UserSettings> = { dark_mode: true }; // Select only the 'theme' field
            const mockSettings = new UserSettings();
            jest.spyOn(userRepository, "findOne").mockResolvedValue(mockSettings);

            const result = await service.findOne(condition, select);
            expect(result).toEqual(mockSettings);
            expect(userRepository.findOne).toHaveBeenCalledWith({
                loadEagerRelations: false,
                relations: { user: true },
                where: condition,
                select: select
            });
        });
    });

    describe("update", () => {
        it("should update user settings and return the updated settings", async () => {
            const id = 1;
            const data = { language: "en" };
            const updatedSettings = {
                id: 1,
                language: "en"
            }; // Assuming language was previously 'en'
            jest.spyOn(userRepository, "update").mockResolvedValue({ affected: 1 } as any);
            jest.spyOn(userRepository, "findOne").mockResolvedValue(updatedSettings as any);

            const result = await service.update(id, data);
            expect(result).toEqual(updatedSettings);
        });
    });

    describe("delete", () => {
        it("should delete user settings", async () => {
            const id = 1;
            jest.spyOn(userRepository, "delete").mockReturnValue({} as any);
            const result = await service.delete(id);
            expect(userRepository.delete).toHaveBeenCalled();
            /*expect(result).toEqual({
                raw: [],
                affected: 1
            });*/
        });
    });
});
