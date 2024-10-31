import { Test, TestingModule } from "@nestjs/testing";
import { BlockedUsersService } from "./blocked_users.service";
import { Repository } from "typeorm";
import { BlockedUser } from "./entities/blocked_user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CreateBlockedUserDto } from "./dto/create-blocked_user.dto";
import { User } from "../user/models/user.entity";

describe("BlockedUsersService", () => {
    let blockedUsersService: BlockedUsersService;
    let blockedUserRepository: Repository<BlockedUser>;

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

        blockedUsersService = module.get<BlockedUsersService>(BlockedUsersService);
        blockedUserRepository = module.get<Repository<BlockedUser>>(getRepositoryToken(BlockedUser));
    });

    it("should be defined", () => {
        expect(blockedUsersService).toBeDefined();
    });

    describe("create", () => {
        it("should create a new blocked user", async () => {
            const createBlockedUserDto: CreateBlockedUserDto = {
                user_id: 1,
                blocked_user_id: 5
            };
            const blockedUser: BlockedUser = {
                id: 1,
                user_id: 1,
                blocked_user_id: 5,
                user: new User,
                blocked_user: new User
            };
            jest.spyOn(blockedUserRepository, "save").mockReturnValue(blockedUser as any);
            const result = await blockedUsersService.create(createBlockedUserDto);
            expect(result).toMatchObject(blockedUser);
        });
    });

    describe("findByBlocker", () => {
        it("should return a list of blocked users for a specific user", async () => {
            const blockedUsers: BlockedUser[] = [
                {
                    id: 1,
                    user_id: 1,
                    blocked_user_id: 2,
                    user: new User,
                    blocked_user: new User
                },
                {
                    id: 1,
                    user_id: 1,
                    blocked_user_id: 3,
                    user: new User,
                    blocked_user: new User
                }
            ];
            jest.spyOn(blockedUserRepository, "find").mockResolvedValue(blockedUsers);
            const result = await blockedUsersService.findByBlocker(1, new User);
            expect(result).toMatchObject(blockedUsers);
        });
    });

    describe("findOne", () => {
        it("should return an association for a specific user and a specific blocked user", async () => {
            const blockedUser: BlockedUser = {
                id: 1,
                user_id: 1,
                blocked_user_id: 2,
                user: new User,
                blocked_user: new User
            };
            jest.spyOn(blockedUserRepository, "findOne").mockResolvedValue(blockedUser);
            const result = await blockedUsersService.findOne(1, 2);
            expect(result).toMatchObject(blockedUser);
        });
    });

    describe("remove", () => {
        it("should remove an association of user and blocked user", async () => {
            const blockedUser: BlockedUser = {
                id: 1,
                user_id: 1,
                blocked_user_id: 2,
                user: new User,
                blocked_user: new User
            };
            jest.spyOn(blockedUserRepository, "delete").mockResolvedValue({ affected: 1 } as any);
            const result = await blockedUsersService.remove(1, 2);
            expect(result.affected).toEqual(1);
        });
    });
});
