import { Test, TestingModule } from "@nestjs/testing";
import { UserSettingsService } from "./user_settings_service";
import { DeepPartial, Repository, UpdateResult } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserSettings } from "./models/user_settings.entity";

describe("UserSettingsService", () => {
    let service: UserSettingsService;
    let repository: Repository<UserSettings>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserSettingsService,
                {
                    provide: getRepositoryToken(UserSettings),
                    useClass: Repository
                }
            ]
        }).compile();

        service = module.get<UserSettingsService>(UserSettingsService);
        repository = module.get<Repository<UserSettings>>(getRepositoryToken(UserSettings));
    });

    describe("all", () => {
        it("should return an array of user settings", async () => {
            const userSettingsArray = [{ id: 1, user_id: 1 }] as UserSettings[];
            jest.spyOn(repository, "find").mockResolvedValue(userSettingsArray);

            expect(await service.all()).toEqual(userSettingsArray);
        });
    });

    describe("create", () => {
        it("should create and save a new user settings record", async () => {
            const dto: DeepPartial<UserSettings> = { user_id: 1 };
            const userSetting = new UserSettings();
            jest.spyOn(repository, "save").mockResolvedValue(userSetting);

            expect(await service.create(dto)).toEqual(userSetting);
        });
    });

    describe("findOne", () => {
        it("should find one user setting by given condition", async () => {
            const condition = { id: 1 };
            const userSetting = new UserSettings();
            jest.spyOn(repository, "findOne").mockResolvedValue(userSetting);

            expect(await service.findOne(condition)).toEqual(userSetting);
        });
    });

    describe("update", () => {
        it("should update user settings by id", async () => {
            const id = 1;
            const dto = { automatic_new_gallery_share: true };
            const userSetting = new UserSettings();
            jest.spyOn(repository, "update").mockResolvedValue({} as UpdateResult);
            jest.spyOn(service, "findOne").mockResolvedValue(userSetting);

            expect(await service.update(id, dto as any)).toEqual(userSetting);
        });
    });

    describe("delete", () => {
        it("should delete a user setting by id", async () => {
            const id = 1;
            jest.spyOn(repository, "delete").mockResolvedValue({} as any);

            expect(await service.delete(id)).toEqual({});
        });
    });
});
