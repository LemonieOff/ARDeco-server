import { Test, TestingModule } from "@nestjs/testing";
import { BlockedUsersService } from "./blocked_users.service";
import { Repository } from "typeorm";
import { BlockedUser } from "./entities/blocked_user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CreateBlockedUserDto } from "./dto/create-blocked_user.dto";
import { User } from "../user/models/user.entity";
import { UserSettings } from "../user_settings/models/user_settings.entity";

describe("BlockedUsersService", () => {
    let service: BlockedUsersService;
    let repository: Repository<BlockedUser>;

    const mockUser = new User();
    mockUser.id = 1;
    mockUser.settings = { display_lastname_on_public: true } as UserSettings;

    const mockBlockedUser = new BlockedUser();
    mockBlockedUser.id = 2;
    mockBlockedUser.user_id = 1;
    mockBlockedUser.blocked_user_id = 2;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BlockedUsersService,
                {
                    provide: getRepositoryToken(BlockedUser),
                    useValue: {
                        save: jest.fn(),
                        find: jest.fn(),
                        findOne: jest.fn(),
                        delete: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<BlockedUsersService>(BlockedUsersService);
        repository = module.get<Repository<BlockedUser>>(getRepositoryToken(BlockedUser));
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("create", () => {
        it("should create a new blocked user relationship", async () => {
            const createBlockedUserDto: CreateBlockedUserDto = {
                user_id: 1,
                blocked_user_id: 2
            };
            jest.spyOn(repository, "save").mockResolvedValue(mockBlockedUser as any);

            const result = await service.create(createBlockedUserDto);

            expect(repository.save).toHaveBeenCalledWith(createBlockedUserDto);
            expect(result).toEqual(mockBlockedUser);
        });
    });

    describe("findByBlocker", () => {
        it("should return an array of blocked users for a given blocker", async () => {
            const blockerId = 1;
            const blockedUsers = [
                { ...mockBlockedUser, blocked_user: { ...mockUser, id: 2, settings: { display_lastname_on_public: false } } },
                { ...mockBlockedUser, blocked_user: { ...mockUser, id: 3, settings: { display_lastname_on_public: true } } }
            ];
            jest.spyOn(repository, "find").mockResolvedValue(blockedUsers as any);


            const result = await service.findByBlocker(blockerId, mockUser);

            expect(repository.find).toHaveBeenCalledWith({
                loadEagerRelations: false,
                loadRelationIds: false,
                relations: { blocked_user: { settings: true } },
                select: {
                    blocked_user: {
                        first_name: true,
                        id: true,
                        last_name: true,
                        settings: {
                            display_lastname_on_public: true
                        }
                    }
                },
                where: { user_id: blockerId }
            });
            expect(result).toEqual([
                { ...mockBlockedUser, blocked_user: { id: 2, last_name: "" } },
                { ...mockBlockedUser, blocked_user: { id: 3 } }
            ]);
        });
    });

    describe("findByBlocked", () => {
        it("should return an array of users who blocked a given user", async () => {
            const blockedId = 2;
            const mockBlockers = [
                { id: 1, user_id: 1, blocked_user_id: blockedId },
                { id: 2, user_id: 3, blocked_user_id: blockedId }
            ];
            jest.spyOn(repository, "find").mockResolvedValue(mockBlockers as any);

            const result = await service.findByBlocked(blockedId);

            expect(repository.find).toHaveBeenCalledWith({
                where: { blocked_user_id: blockedId }
            });
            expect(result).toEqual(mockBlockers);
        });
    });

    describe("findByBlockedAndBlocking", () => {
        it("should return two arrays of blocked and blocking users", async () => {
            const userId = 1;
            const mockBlockedUsers = [
                { id: 1, user_id: userId, blocked_user_id: 2 },
                { id: 2, user_id: userId, blocked_user_id: 3 },
                { id: 3, user_id: 4, blocked_user_id: userId }
            ];
            jest.spyOn(repository, "find").mockResolvedValue(mockBlockedUsers as any);

            const result = await service.findByBlockedAndBlocking(userId);

            expect(repository.find).toHaveBeenCalledWith({
                where: [{ user_id: userId }, { blocked_user_id: userId }]
            });
            expect(result).toEqual([[2, 3], [4]]);
        });
    });

    describe("checkBlockedForBlocker", () => {
        it("should return true if blocker has blocked blocked", async () => {
            const blockerId = 1;
            const blockedId = 2;
            jest.spyOn(repository, "findOne").mockResolvedValue(mockBlockedUser as any);

            const result = await service.checkBlockedForBlocker(blockerId, blockedId);

            expect(repository.findOne).toHaveBeenCalledWith({
                where: { user_id: blockerId, blocked_user_id: blockedId }
            });
            expect(result).toBe(true);
        });

        it("should return false if blocker has not blocked blocked", async () => {
            const blockerId = 1;
            const blockedId = 3;
            jest.spyOn(repository, "findOne").mockResolvedValue(null);

            const result = await service.checkBlockedForBlocker(blockerId, blockedId);

            expect(repository.findOne).toHaveBeenCalledWith({
                where: { user_id: blockerId, blocked_user_id: blockedId }
            });
            expect(result).toBe(false);
        });
    });

    describe("findOne", () => {
        it("should return a blocked user relationship for given user and blocked user IDs", async () => {
            const userId = 1;
            const blockedUserId = 2;
            jest.spyOn(repository, "findOne").mockResolvedValue(mockBlockedUser);

            const result = await service.findOne(userId, blockedUserId);

            expect(repository.findOne).toHaveBeenCalledWith({
                select: ["id"],
                where: { user_id: userId, blocked_user_id: blockedUserId }
            });
            expect(result).toEqual(mockBlockedUser);
        });
    });

    describe("remove", () => {
        it("should remove a blocked user relationship", async () => {
            const userId = 1;
            const blockedUserId = 2;
            const deleteResult = { affected: 1 };
            jest.spyOn(repository, "delete").mockResolvedValue(deleteResult as any);

            const result = await service.remove(userId, blockedUserId);

            expect(repository.delete).toHaveBeenCalledWith({ user_id: userId, blocked_user_id: blockedUserId });
            expect(result).toEqual(deleteResult);
        });
    });
});
