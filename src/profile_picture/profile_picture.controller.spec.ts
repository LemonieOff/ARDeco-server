import { Test, TestingModule } from '@nestjs/testing';
import { ProfilePictureController } from './profile_picture.controller';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/models/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Response, Request } from 'express';

describe('ProfilePictureController', () => {
    let controller: ProfilePictureController;
    let userService: UserService;
    const res = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProfilePictureController],
            providers: [
                UserService,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
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
            ],
        }).compile();

        controller = module.get<ProfilePictureController>(ProfilePictureController);
        userService = module.get<UserService>(UserService);
    });

    // Tests pour checkAuthorizationForUser
    /*describe('checkAuthorizationForUser', () => {
        it('should return 401 if no cookie or invalid JWT', async () => {
            const req = { cookies: {} } as any;
            
            const result = await controller['checkAuthorizationForUser'](req, res, 'get');
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: 'KO',
                code: 401,
                description: "You have to login in order to access profile picture's tools",
                data: null,
            });
        });

        it('should return 403 if user not found', async () => {
            const req = { cookies: { jwt: "token" } } as any;
            
            
            jest.spyOn(userService, 'findOne').mockResolvedValue(null);

            const result = await controller['checkAuthorizationForUser'](req, res, 'get');
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: 'KO',
                code: 403,
                description: "You are not allowed to access profile picture's tools",
                data: null,
            });
        });

        it('should return 404 if specified user not found (non-get)', async () => {
            const req = { cookies: { jwt: "token" } } as any;
            
            
            jest.spyOn(userService, 'findOne')
                .mockResolvedValueOnce(new User()) // User exists
                .mockResolvedValueOnce(null); // Specified user not found

            const result = await controller['checkAuthorizationForUser'](req, res, 'set', 2);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: 'KO',
                code: 404,
                description: 'User not found',
                data: null,
            });
        });

        it('should return 403 if not authorized for another user (non-get)', async () => {
            const req = { cookies: { jwt: "token" } } as any;
            
            const user = new User();
            user.id = 1;
            user.role = 'admin';
            const otherUser = new User;
            otherUser.id = 2;
            
            jest.spyOn(userService, 'findOne')
                .mockResolvedValueOnce(user) // Current user
                .mockResolvedValueOnce(otherUser); // Specified user

            const result = await controller['checkAuthorizationForUser'](req, res, 'set', 2);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: 'KO',
                code: 403,
                description: "You are not allowed to access profile picture's tools for another user",
                data: null,
            });
        });

        it('should return user if authorized (get)', async () => {
            const req = { cookies: { jwt: "token" } } as any;
            
            const user = new User();
            
            jest.spyOn(userService, 'findOne').mockResolvedValue(user);

            const result = await controller['checkAuthorizationForUser'](req, res, 'get');
            expect(result).toBe(user);
        });

        it('should return user if authorized (set) and same user', async () => {
            const req = { cookies: { jwt: "token" } } as any;
            
            const user = new User();
            user.id = 1;
            
            jest.spyOn(userService, 'findOne').mockResolvedValue(user);

            const result = await controller['checkAuthorizationForUser'](req, res, 'set', 1);
            expect(result).toBe(user);
        });

        it('should return user if authorized (set) and admin', async () => {
            const req = { cookies: { jwt: "token" } } as any;
            
            const user = new User();
            user.id = 1;
            user.role = 'admin';
            const otherUser = new User;
            otherUser.id = 2;
            
            jest.spyOn(userService, 'findOne')
                .mockResolvedValueOnce(user) // Current user (admin)
                .mockResolvedValueOnce(otherUser); // Specified user

            const result = await controller['checkAuthorizationForUser'](req, res, 'set', 2);
            expect(result).toBe(user);
        });
    });*/

    // Tests pour getCurrentUserProfilePicture
    describe('getCurrentUserProfilePicture', () => {
        it('should return 200 and profile picture ID if authorized', async () => {
            const req = { cookies: { jwt: "token" } } as any;
            
            const user = new User();
            user.profile_picture_id = 3;
            
            jest.spyOn(userService, 'findOne').mockResolvedValue(user);

            const result = await controller.getCurrentUserProfilePicture(req, res);
            expect(res.status).not.toHaveBeenCalled(); // Status should not be changed
            expect(result).toEqual({
                status: 'OK',
                code: 200,
                description: 'Profile picture id',
                data: 3,
            });
        });

        it('should return 401 if not authorized', async () => {
            const req = { cookies: {} } as any;
            

            const result = await controller.getCurrentUserProfilePicture(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: 'KO',
                code: 401,
                description: "You have to login in order to access profile picture's tools",
                data: null,
            });
        });
    });

    // Tests pour getUserProfilePicture
    // ... (Les tests pour checkAuthorizationForUser et getCurrentUserProfilePicture sont déjà inclus) ...

    describe('getUserProfilePicture', () => {
        /*it('should return 200 and profile picture ID if authorized', async () => {
            const req = { cookies: { jwt: "token" } } as any;
            
            const user = new User();
            user.profile_picture_id = 2;
            
            jest.spyOn(userService, 'findOne')
                .mockResolvedValueOnce(user) // Current user
                .mockResolvedValueOnce(user); // Specified user

            const result = await controller.getUserProfilePicture(req, res, 1); // Assuming user ID 1
            expect(res.status).not.toHaveBeenCalled();
            expect(result).toEqual({
                status: 'OK',
                code: 200,
                description: 'Profile picture id',
                data: 2,
            });
        });*/

        it('should return 401 if not authorized', async () => {
            const req = { cookies: {} } as any;
            

            const result = await controller.getUserProfilePicture(req, res, 1);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: 'KO',
                code: 401,
                description: "You have to login in order to access profile picture's tools",
                data: null,
            });
        });

        it('should return 404 if specified user not found', async () => {
            const req = { cookies: { jwt: "token" } } as any;
            
            
            jest.spyOn(userService, 'findOne')
                .mockResolvedValueOnce(new User()) // Current user
                .mockResolvedValueOnce(null); // Specified user not found

            const result = await controller.getUserProfilePicture(req, res, 2);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: 'KO',
                code: 404,
                description: 'User not found',
                data: null,
            });
        });
    });

    describe('setCurrentUserProfilePicture', () => {
        it('should update profile picture and return 200 if authorized and valid picture ID', async () => {
            const req = {
                cookies: { jwt: 'valid.jwt.token' },
                body: { picture_id: 2 },
            } as any;

            const user = new User();
            user.id = 1;

            jest.spyOn(userService, 'findOne').mockResolvedValue(user);
            jest.spyOn(userService, 'update').mockResolvedValue(undefined);

            const result = await controller.setCurrentUserProfilePicture(req, res, 2);
            expect(userService.update).toHaveBeenCalledWith(1, { profile_picture_id: 2 });
            expect(result).toEqual({
                status: 'OK',
                code: 200,
                description: 'Profile picture id updated',
                data: 2,
            });
        });

        it('should return 401 if not authorized', async () => {
            const req = { cookies: {} } as any;
            

            const result = await controller.setCurrentUserProfilePicture(req, res, 2);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: 'KO',
                code: 401,
                description: "You have to login in order to access profile picture's tools",
                data: null,
            });
        });

        it('should return 400 if invalid picture ID', async () => {
            const req = {
                cookies: { jwt: 'valid.jwt.token' },
                body: { picture_id: 5 }, // Invalid picture ID
            } as any;
            
            const user = new User();
            user.id = 1;
            
            jest.spyOn(userService, 'findOne').mockResolvedValue(user);

            const result = await controller.setCurrentUserProfilePicture(req, res, 5);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: 'KO',
                code: 400,
                description: 'Invalid picture id',
                data: null,
            });
        });

        it('should return 403 if not authorized for another user (non-admin)', async () => {
            const req = {
                cookies: { jwt: 'valid.jwt.token' },
                body: { picture_id: 2 },
            } as any;
            
            const user = new User();
            user.id = 1;
            user.role = 'user';
            const otherUser = new User;
            otherUser.id = 2;
            
            jest.spyOn(userService, 'findOne')
                .mockResolvedValueOnce(user) // Current user (not admin)
                .mockResolvedValueOnce(otherUser); // Specified user

            const result = await controller.setUserProfilePicture(req, res, 2, 2);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: 'KO',
                code: 403,
                description: "You are not allowed to access profile picture's tools for another user",
                data: null,
            });
        });
    });

    describe('deleteCurrentUserProfilePicture', () => {
        it('should delete profile picture and return 200 if authorized', async () => {
            const req = { cookies: { jwt: "token" } } as any;
            
            const user = new User();
            user.id = 1;
            
            jest.spyOn(userService, 'findOne').mockResolvedValue(user);
            jest.spyOn(userService, 'update').mockResolvedValue(undefined);

            const result = await controller.deleteCurrentUserProfilePicture(req, res);
            expect(userService.update).toHaveBeenCalledWith(1, { profile_picture_id: 0 });
            expect(result).toEqual({
                status: 'OK',
                code: 200,
                description: 'Profile picture reinitialized',
                data: 0,
            });
        });

        it('should return 401 if not authorized', async () => {
            const req = { cookies: {} } as any;
            

            const result = await controller.deleteCurrentUserProfilePicture(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: 'KO',
                code: 401,
                description: "You have to login in order to access profile picture's tools",
                data: null,
            });
        });

        it('should return 403 if user not found', async () => {
            const req = { cookies: { jwt: "token" } } as any;
            
            
            jest.spyOn(userService, 'findOne').mockResolvedValue(null);

            const result = await controller.deleteCurrentUserProfilePicture(req, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: 'KO',
                code: 403,
                description: "You are not allowed to access profile picture's tools",
                data: null,
            });
        });

        /*it('should return 500 if userService.update throws an error', async () => {
            const req = { cookies: { jwt: "token" } } as any;
            
            const user = new User();
            user.id = 1;
            
            jest.spyOn(userService, 'findOne').mockResolvedValue(user);
            jest.spyOn(userService, 'update').mockRejectedValue(new Error('Database error'));

            const result = await controller.deleteCurrentUserProfilePicture(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(result).toEqual({
                status: 'KO',
                code: 500,
                description: 'Internal server error',
                data: null,
            });
        });*/
    });

    describe('deleteUserProfilePicture', () => {
        it('should delete profile picture and return 200 if authorized (admin)', async () => {
            const req = { cookies: { jwt: "token" } } as any;
            
            const adminUser = new User();
            adminUser.id = 1;
            adminUser.role = 'admin';
            const targetUser = new User();
            targetUser.id = 2;
            
            jest.spyOn(userService, 'findOne')
                .mockResolvedValueOnce(adminUser) // Current user (admin)
                .mockResolvedValueOnce(targetUser); // Specified user
            jest.spyOn(userService, 'update').mockResolvedValue(undefined);

            const result = await controller.deleteUserProfilePicture(req, res, 2);
            expect(userService.update).toHaveBeenCalledWith(2, { profile_picture_id: 0 });
            expect(result).toEqual({
                status: 'OK',
                code: 200,
                description: 'Profile picture reinitialized',
                data: 0,
            });
        });

        it('should delete profile picture and return 200 if authorized (same user)', async () => {
            const req = { cookies: { jwt: "token" } } as any;
            
            const user = new User();
            user.id = 1;
            
            jest.spyOn(userService, 'findOne').mockResolvedValue(user);
            jest.spyOn(userService, 'update').mockResolvedValue(undefined);

            const result = await controller.deleteUserProfilePicture(req, res, 1);
            expect(userService.update).toHaveBeenCalledWith(1, { profile_picture_id: 0 });
            expect(result).toEqual({
                status: 'OK',
                code: 200,
                description: 'Profile picture reinitialized',
                data: 0,
            });
        });

        it('should return 401 if not authorized', async () => {
            const req = { cookies: {} } as any;
            

            const result = await controller.deleteUserProfilePicture(req, res, 1);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: 'KO',
                code: 401,
                description: "You have to login in order to access profile picture's tools",
                data: null,
            });
        });

        it('should return 403 if user not found', async () => {
            const req = { cookies: { jwt: "token" } } as any;
            
            
            jest.spyOn(userService, 'findOne').mockResolvedValue(null);

            const result = await controller.deleteUserProfilePicture(req, res, 1);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: 'KO',
                code: 403,
                description: "You are not allowed to access profile picture's tools",
                data: null,
            });
        });

        it('should return 404 if specified user not found', async () => {
            const req = { cookies: { jwt: "token" } } as any;
            
            
            jest.spyOn(userService, 'findOne')
                .mockResolvedValueOnce(new User()) // Current user
                .mockResolvedValueOnce(null); // Specified user not found

            const result = await controller.deleteUserProfilePicture(req, res, 2);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: 'KO',
                code: 404,
                description: 'User not found',
                data: null,
            });
        });

        it('should return 403 if not authorized for another user (non-admin)', async () => {
            const req = { cookies: { jwt: "token" } } as any;
            
            const user = new User();
            user.id = 1;
            user.role = 'user';
            const otherUser = new User;
            otherUser.id = 2;
            
            jest.spyOn(userService, 'findOne')
                .mockResolvedValueOnce(user) // Current user (not admin)
                .mockResolvedValueOnce(otherUser); // Specified user

            const result = await controller.deleteUserProfilePicture(req, res, 2);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: 'KO',
                code: 403,
                description: "You are not allowed to access profile picture's tools for another user",
                data: null,
            });
        });

        /*it('should return 500 if userService.update throws an error', async () => {
            const req = { cookies: { jwt: "token" } } as any;
            
            const user = new User();
            user.id = 1;
            
            jest.spyOn(userService, 'findOne').mockResolvedValue(user);
            jest.spyOn(userService, 'update').mockRejectedValue(new Error('Database error'));

            const result = await controller.deleteUserProfilePicture(req, res, 1);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(result).toEqual({
                status: 'KO',
                code: 500,
                description: 'Internal server error',
                data: null,
            });
        });*/
    });

    describe('getPicture', () => {
        it('should return 200 and picture URL if valid picture ID', async () => {
            const req = { cookies: { jwt: "token" } } as any;
            
            const pictureId = 2; // Valid picture ID

            const result = await controller.getPicture(req, res, pictureId);
            expect(result).toEqual({
                status: 'OK',
                code: 200,
                description: 'Profile picture',
                data: `https://api.ardeco.app/profile_pictures/${pictureId}.png`,
            });
        });

        it('should return 404 if invalid picture ID', async () => {
            const req = { cookies: { jwt: "token" } } as any;
            
            const pictureId = 5; // Invalid picture ID

            const result = await controller.getPicture(req, res, pictureId);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: 'KO',
                code: 404,
                description: 'Profile picture not found',
                data: null,
            });
        });

        it('should return 404 if picture ID is negative', async () => {
            const req = { cookies: { jwt: "token" } } as any;
            
            const pictureId = -1; // Negative picture ID

            const result = await controller.getPicture(req, res, pictureId);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: 'KO',
                code: 404,
                description: 'Profile picture not found',
                data: null,
            });
        });
    });

});
