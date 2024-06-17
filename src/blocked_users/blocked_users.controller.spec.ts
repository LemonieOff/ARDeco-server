import { Test, TestingModule } from "@nestjs/testing";
import { BlockedUsersController } from "./blocked_users.controller";
import { getRepositoryToken } from "@nestjs/typeorm";
import { BlockedUser } from "./entities/blocked_user.entity";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { BlockedUsersService } from "./blocked_users.service";
import { User } from "../user/models/user.entity";

describe("BlockedUsersController", () => {
    let blockedUsersController: BlockedUsersController;
    let blockedUsersService: BlockedUsersService;
    let userService: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BlockedUsersController],
            providers: [
                BlockedUsersService,
                UserService,
                {
                    provide: getRepositoryToken(BlockedUser),
                    useValue: {
                        save: jest.fn(),
                        find: jest.fn(),
                        findOne: jest.fn(),
                        delete: jest.fn()
                    }
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                        createQueryBuilder: jest.fn().mockReturnValue({
                            delete: jest.fn().mockReturnValue({
                                from: jest.fn().mockReturnValue({
                                    where: jest.fn().mockReturnValue({
                                        execute: jest.fn()
                                    })
                                })
                            })
                        })
                    }
                },
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn().mockResolvedValue("token"),
                        verify: jest.fn().mockReturnValue({ id: 1 }),
                        verifyAsync: jest.fn().mockResolvedValue({ id: 1 })
                    }
                }
            ]
        }).compile();

        blockedUsersController = module.get<BlockedUsersController>(BlockedUsersController);
        blockedUsersService = module.get<BlockedUsersService>(BlockedUsersService);
        userService = module.get<UserService>(UserService);
    });

    it("should be defined", () => {
        expect(blockedUsersController).toBeDefined();
    });

    describe("getBlockedUsers", () => {
        it("should return an array of blocked users", async () => {
            const user: User = new User;
            user.id = 1;
            jest.spyOn(userService, "findOne").mockResolvedValue(user);
            const blockedUsers = [{
                id: 1,
                user_id: 1,
                blocked_user_id: 2
            }, {
                id: 1,
                user_id: 1,
                blocked_user_id: 3
            }, {
                id: 1,
                user_id: 1,
                blocked_user_id: 4
            }];
            jest.spyOn(blockedUsersService, "findAll").mockResolvedValue(blockedUsers);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            await blockedUsersController.getBlockedUsers(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: "OK",
                code: 200,
                data: blockedUsers.map(user => user.blocked_user_id)
            }));
        });

        it("should return error 401 if not connected", async () => {
            const req = { cookies: { jwt: undefined } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.getBlockedUsers(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 401,
                data: null
            }));
        });

        it("should return error 403 if user doesn't exist", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue(null);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.getBlockedUsers(req, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 403,
                data: null
            }));
        });
    });

    describe("getBlockedUsersForUser", () => {
        it("should return an array of blocked users", async () => {
            const user: User = new User;
            user.id = 1;
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(user);
            const blockedUsers = [{
                id: 1,
                user_id: 1,
                blocked_user_id: 2
            }, {
                id: 1,
                user_id: 1,
                blocked_user_id: 3
            }, {
                id: 1,
                user_id: 1,
                blocked_user_id: 4
            }];
            jest.spyOn(blockedUsersService, "findAll").mockResolvedValue(blockedUsers);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            await blockedUsersController.getBlockedUsersForUser(req, res, 1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: "OK",
                code: 200,
                data: blockedUsers.map(user => user.blocked_user_id)
            }));
        });

        it("should return error 401 if not connected", async () => {
            const req = { cookies: { jwt: undefined } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.getBlockedUsersForUser(req, res, 1);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 401,
                data: null
            }));
        });

        it("should return error 403 if user doesn't exist", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue(null);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.getBlockedUsersForUser(req, res, 5);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 403,
                data: null
            }));
        });

        it("should return error 400 if user to retrieve is not a number", async () => {
            const user: User = new User;
            user.id = 1;
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(user);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.getBlockedUsersForUser(req, res, "NaN" as any);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 400,
                data: null
            }));
        });

        it("should return error 403 if user is not self and not an admin", async () => {
            const user: User = new User;
            user.id = 1;
            user.role = "client";
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(user);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.getBlockedUsersForUser(req, res, 5);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 403,
                data: null
            }));
        });

        it("should return error 404 if user to check is not found", async () => {
            const user: User = new User;
            user.id = 1;
            user.role = "admin";
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(user)
                .mockResolvedValueOnce(null);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.getBlockedUsersForUser(req, res, 5);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 404,
                data: null
            }));
        });
    });

    describe("blockUser", () => {
        it("should return 200 on block", async () => {
            const user: User = new User;
            user.id = 1;
            const userToBlock = new User;
            userToBlock.id = 5;
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(user as any)
                .mockResolvedValueOnce(userToBlock as any);
            jest.spyOn(blockedUsersService, "findOne").mockResolvedValue(null);
            jest.spyOn(blockedUsersService, "create").mockResolvedValue({} as any);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.blockUser(req, res, 5);
            console.log(result);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(result).toMatchObject(expect.objectContaining({
                status: "OK",
                code: 200,
                data: null
            }));
        });

        it("should return error 400 if user id is not a number", async () => {
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.blockUser(req, res, "NaN" as any);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 400,
                data: null
            }));
        });

        it("should return error 401 if not connected", async () => {
            const req = { cookies: { jwt: undefined } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.blockUser(req, res, 5);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 401,
                data: null
            }));
        });

        it("should return error 403 if request user doesn't exist", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.blockUser(req, res, 5);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 403,
                data: null
            }));
        });

        it("should return 400 if request user tries to block itself", async () => {
            const user: User = new User;
            user.id = 1;
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(user as any);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.blockUser(req, res, 1);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 400,
                data: null
            }));
        });

        it("should return error 404 if user to block is not found", async () => {
            const user: User = new User;
            user.id = 1;
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(user as any)
                .mockResolvedValueOnce(null);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.blockUser(req, res, 5);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 404,
                data: null
            }));
        });

        it("should return error 400 if user is already blocked", async () => {
            const user: User = new User;
            user.id = 1;
            const userToBlock = new User;
            userToBlock.id = 5;
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(user as any)
                .mockResolvedValueOnce(userToBlock as any);
            jest.spyOn(blockedUsersService, "findOne").mockResolvedValueOnce({} as any);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.blockUser(req, res, 5);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 400,
                data: null
            }));
        });

        it("should return error 501 if user blocked has not been created", async () => {
            const user: User = new User;
            user.id = 1;
            const userToBlock = new User;
            userToBlock.id = 5;
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(user as any)
                .mockResolvedValueOnce(userToBlock as any);
            jest.spyOn(blockedUsersService, "findOne").mockResolvedValueOnce(null);
            jest.spyOn(blockedUsersService, "create").mockResolvedValueOnce(null);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.blockUser(req, res, 5);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 501,
                data: null
            }));
        });

        it("should return error 501 on server error", async () => {
            const user: User = new User;
            user.id = 1;
            const userToBlock = new User;
            userToBlock.id = 5;
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(user as any)
                .mockResolvedValueOnce(userToBlock as any);
            jest.spyOn(blockedUsersService, "findOne").mockResolvedValueOnce(null);
            jest.spyOn(blockedUsersService, "create").mockImplementationOnce(() => {
                throw new Error();
            });
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.blockUser(req, res, 5);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 501,
                data: null
            }));
        });
    });

    describe("unblockUser", () => {
        it("should return 200 on unblock", async () => {
            const user: User = new User;
            user.id = 1;
            const userToUnblock = new User;
            userToUnblock.id = 5;
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(user as any)
                .mockResolvedValueOnce(userToUnblock as any);
            jest.spyOn(blockedUsersService, "findOne").mockResolvedValue({} as any);
            jest.spyOn(blockedUsersService, "remove").mockResolvedValue({} as any);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.unblockUser(req, res, 5);
            console.log(result);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(result).toMatchObject(expect.objectContaining({
                status: "OK",
                code: 200,
                data: null
            }));
        });

        it("should return error 400 if user id is not a number", async () => {
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.unblockUser(req, res, "NaN" as any);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 400,
                data: null
            }));
        });

        it("should return error 401 if not connected", async () => {
            const req = { cookies: { jwt: undefined } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.unblockUser(req, res, 5);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 401,
                data: null
            }));
        });

        it("should return error 403 if request user doesn't exist", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.unblockUser(req, res, 5);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 403,
                data: null
            }));
        });

        it("should return 400 if request user tries to block itself", async () => {
            const user: User = new User;
            user.id = 1;
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(user as any);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.unblockUser(req, res, 1);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 400,
                data: null
            }));
        });

        it("should return error 404 if user to block is not found", async () => {
            const user: User = new User;
            user.id = 1;
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(user as any)
                .mockResolvedValueOnce(null);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.unblockUser(req, res, 5);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 404,
                data: null
            }));
        });

        it("should return error 400 if user is not blocked", async () => {
            const user: User = new User;
            user.id = 1;
            const userToUnblock = new User;
            userToUnblock.id = 5;
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(user as any)
                .mockResolvedValueOnce(userToUnblock as any);
            jest.spyOn(blockedUsersService, "findOne").mockResolvedValueOnce(null);
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.unblockUser(req, res, 5);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 400,
                data: null
            }));
        });

        it("should return error 501 on server error", async () => {
            const user: User = new User;
            user.id = 1;
            const userToBlock = new User;
            userToBlock.id = 5;
            jest.spyOn(userService, "findOne")
                .mockResolvedValueOnce(user as any)
                .mockResolvedValueOnce(userToBlock as any);
            jest.spyOn(blockedUsersService, "findOne").mockResolvedValueOnce({} as any);
            jest.spyOn(blockedUsersService, "remove").mockImplementationOnce(() => {
                throw new Error();
            });
            const req = { cookies: { jwt: "token" } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as any;
            const result = await blockedUsersController.unblockUser(req, res, 5);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(result).toMatchObject(expect.objectContaining({
                status: "KO",
                code: 501,
                data: null
            }));
        });
    });
});
