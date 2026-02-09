import { Test, TestingModule } from "@nestjs/testing";
import { TicketController } from "./ticket.controller";
import { TicketService } from "./ticket.service";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import { HttpStatus } from "@nestjs/common";
import { Ticket } from "./models/ticket.entity";
import { User } from "../user/models/user.entity";
import { UserSettings } from "../user_settings/models/user_settings.entity";
import { TicketDto } from "./models/ticket.dto";

describe("TicketController", () => {
    let controller: TicketController;
    let ticketService: TicketService;
    let userService: UserService;
    let jwtService: JwtService;

    const mockUser: User = {
        id: 1,
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
        password: "hashedPassword",
        role: "client",
        settings: { display_lastname_on_public: true } as UserSettings,
        galleries: [], galleryLikes: [], galleryComments: [], galleryReports: [],
        feedbacks: [], blocking: [], blocked_by: [], favorite_galleries: [],
        favorite_furniture: [], profile_picture_id: 0, checkEmailToken: null,
        checkEmailSent: null, hasCheckedEmail: false, deleted: false, city: null,
        phone: null, company_api_key: null, cart: null, googleId: null
    };

    const mockTicket: Ticket = {
        id: 1,
        user: mockUser,
        user_id: mockUser.id,
        status: "pending",
        title: "Test Ticket",
        description: "Test Description",
        date: new Date(),
        messages: JSON.stringify([{ sender: "User", content: "Test message", timestamp: new Date().toLocaleString() }])
    };

    const mockRequest = {
        cookies: { jwt: "mockJwt" },
        body: {}
    } as Request;
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as unknown as Response;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TicketController],
            providers: [
                {
                    provide: TicketService,
                    useValue: {
                        all: jest.fn(),
                        findOne: jest.fn(),
                        allForUser: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn()
                    }
                },
                {
                    provide: UserService,
                    useValue: {
                        findOne: jest.fn().mockResolvedValue(mockUser)
                    }
                },
                {
                    provide: JwtService,
                    useValue: {
                        verify: jest.fn().mockReturnValue({ id: 1 })
                    }
                }
            ]
        }).compile();

        controller = module.get<TicketController>(TicketController);
        ticketService = module.get<TicketService>(TicketService);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("getAll", () => {
        it("should return all tickets", async () => {
            const mockTickets: Ticket[] = [mockTicket, { ...mockTicket, id: 2 }];
            const adminUser = { ...mockUser, role: "admin" };
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(adminUser as any);
            jest.spyOn(ticketService, "all").mockResolvedValueOnce(mockTickets as any);
            const changedMessages = JSON.stringify(JSON.parse(mockTicket.messages).map(message => ({ ...message, sender: "Test User" })));
            const changeUserSenderToRealNameSpy = jest.spyOn(controller as any, "changeUserSenderToRealName").mockResolvedValue(changedMessages);

            const result = await controller.getAll(mockRequest, mockResponse);

            expect(userService.findOne).toHaveBeenCalledWith({ id: 1 });
            expect(ticketService.all).toHaveBeenCalled();
            expect(changeUserSenderToRealNameSpy).toHaveBeenCalledTimes(2);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(result).toEqual({
                status: "OK",
                code: HttpStatus.OK,
                description: "All tickets",
                data: [{ ...mockTicket, messages: changedMessages }, { ...mockTicket, id: 2, messages: changedMessages }]
            });
        });

        it("should return 401 if no JWT is provided", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller.getAll(req, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
            expect(result).toEqual({
                status: "KO",
                code: HttpStatus.UNAUTHORIZED,
                description: "You are not logged in",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.getAll(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
            expect(result).toEqual({
                status: "KO",
                code: HttpStatus.FORBIDDEN,
                description: "You are not allowed to access this resource",
                data: null
            });
        });

        it("should return 400 if user is not an admin", async () => {
            const nonAdminUser = { ...mockUser, role: "client" };
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(nonAdminUser as any);
            const result = await controller.getAll(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
            expect(result).toEqual({
                status: "KO",
                code: HttpStatus.BAD_REQUEST,
                description: "You are not an admin",
                data: null
            });
        });

        it("should handle errors from TicketService.all", async () => {
            const adminUser = { ...mockUser, role: "admin" };
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(adminUser as any);
            const error = new Error("Database error");
            jest.spyOn(ticketService, "all").mockRejectedValueOnce(error);

            const result = await controller.getAll(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(result).toEqual({
                status: "KO",
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                description: "Unknown error", // From AllExceptionsFilter
                data: { // From AllExceptionsFilter
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message,
                    error: "Internal Server Error"
                }
            });
        })
    });

    describe("getPending", () => {
        it("should return pending tickets", async () => {
            const mockTickets: Ticket[] = [
                mockTicket,
                { ...mockTicket, id: 2, status: "closed" },
                { ...mockTicket, id: 3, status: "pending" }
            ];
            const adminUser = { ...mockUser, role: "admin" };
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(adminUser as any);
            jest.spyOn(ticketService, "all").mockResolvedValueOnce(mockTickets as any);
            const changedMessages = JSON.stringify(JSON.parse(mockTicket.messages).map(message => ({ ...message, sender: "Test User" })));
            const changeUserSenderToRealNameSpy = jest.spyOn(controller as any, "changeUserSenderToRealName").mockResolvedValue(changedMessages);

            const result = await controller.getPending(mockRequest, mockResponse);

            expect(userService.findOne).toHaveBeenCalledWith({ id: 1 });
            expect(ticketService.all).toHaveBeenCalled();
            expect(changeUserSenderToRealNameSpy).toHaveBeenCalledTimes(2); // Called for all tickets to check status
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(result).toEqual({
                status: "OK",
                code: HttpStatus.OK,
                description: "All pending tickets",
                data: [{ ...mockTicket, messages: changedMessages }, { ...mockTicket, id: 3, messages: changedMessages, status: "pending" }]
            });
        });

        // ... tests for authentication, authorization (non-admin), and error handling
    });

    describe("getRandom", () => {
        it("should return a random pending ticket", async () => {
            const mockTickets: Ticket[] = [{ ...mockTicket, status: "pending" }, { ...mockTicket, id: 2, status: "pending" }];
            const adminUser = { ...mockUser, role: "admin" };
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(adminUser as any);
            jest.spyOn(ticketService, "all").mockResolvedValueOnce(mockTickets as any);
            const changedMessages = JSON.stringify(JSON.parse(mockTicket.messages).map(message => ({ ...message, sender: "Test User" })));
            const changeUserSenderToRealNameSpy = jest.spyOn(controller as any, "changeUserSenderToRealName").mockResolvedValue(changedMessages);
            const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.5); // Mock random to return a consistent value

            const result = await controller.getRandom(mockRequest, mockResponse);

            expect(userService.findOne).toHaveBeenCalledWith({ id: 1 });
            expect(ticketService.all).toHaveBeenCalled();
            expect(changeUserSenderToRealNameSpy).toHaveBeenCalledTimes(2);
            expect(randomSpy).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(result).toEqual({
                status: "OK",
                code: HttpStatus.OK,
                description: "Random pending ticket",
                data: { ...mockTicket, messages: changedMessages, status: "pending", id: 2 }
            });

            randomSpy.mockRestore(); // Restore original Math.random
        });

        // ... tests for authentication, authorization (non-admin), no pending tickets, and error handling
    });

    describe("getStats", () => {
        it("should return ticket statistics", async () => {
            const mockTickets: Ticket[] = [
                { ...mockTicket, status: "pending" },
                { ...mockTicket, id: 2, status: "closed" },
                { ...mockTicket, id: 3, status: "deleted" },
                { ...mockTicket, id: 4, status: "pending" }
            ];
            const adminUser = { ...mockUser, role: "admin" };
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(adminUser as any);
            jest.spyOn(ticketService, "all").mockResolvedValueOnce(mockTickets as any);

            const result = await controller.getStats(mockRequest, mockResponse);

            expect(ticketService.all).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(result).toEqual({
                status: "OK",
                code: HttpStatus.OK,
                description: "Stats",
                data: { pending: 2, closed: 1, deleted: 1 }
            });
        });
    });

    describe("getStatsLast7Days", () => {
        it("should return ticket statistics for the last 7 days", async () => {
            const today = new Date();
            const mockTickets: Ticket[] = [
                { ...mockTicket, date: today },
                { ...mockTicket, id: 2, date: new Date(today.getTime() - 24 * 60 * 60 * 1000) }, // Yesterday
                { ...mockTicket, id: 3, date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000) }, // 2 days ago
                { ...mockTicket, id: 4, date: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000) } // 8 days ago (outside range)
            ];
            const adminUser = { ...mockUser, role: "admin" };
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(adminUser as any);
            jest.spyOn(ticketService, "all").mockResolvedValueOnce(mockTickets as any);

            const result = await controller.getStatsLast7Days(mockRequest, mockResponse);

            expect(ticketService.all).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(result).toEqual({
                status: "OK",
                code: HttpStatus.OK,
                description: "Stats",
                data: {
                    days: {
                        today: 1,
                        yesterday: 1,
                        twoDaysAgo: 1,
                        threeDaysAgo: 0,
                        fourDaysAgo: 0,
                        fiveDaysAgo: 0,
                        sixDaysAgo: 0
                    },
                    total: 3
                }
            });
        });
    });

    describe("getOne", () => {
        // ... tests for authentication, authorization (non-owner, non-admin), deleted ticket, and successful retrieval
    });

    describe("getViaUser", () => {
        // ... tests for authentication, authorization (non-owner, non-admin), invalid user ID, and successful retrieval
    });

    describe("editViaParam", () => {
        // ... tests for successful update and error handling
    });

    describe("closeTicket", () => {
        // ... tests for authentication, authorization (non-owner, non-admin), already closed, deleted ticket, and successful closure
    });

    describe("delete", () => {
        // ... tests for authentication, authorization (non-admin), not found, already deleted, and successful deletion
    });

    describe("createTicket", () => {
        it("should create a new ticket", async () => {
            const ticketDto: TicketDto = {
                title: "Test Title",
                description: "Test Description",
                message: "Test Message"
            };
            const createdTicket = { ...mockTicket, title: ticketDto.title, description: ticketDto.description };
            jest.spyOn(ticketService, "create").mockResolvedValueOnce(createdTicket as any);
            const changeUserSenderToRealNameSpy = jest.spyOn(controller as any, "changeUserSenderToRealName").mockResolvedValueOnce(mockTicket.messages);


            const result = await controller.createTicket(mockRequest, ticketDto, mockResponse);

            expect(ticketService.create).toHaveBeenCalledWith(expect.objectContaining({
                title: ticketDto.title,
                description: ticketDto.description,
                messages: JSON.stringify([{
                    sender: "User",
                    content: ticketDto.message,
                    timestamp: expect.any(String)
                }]),
                user_id: mockUser.id,
                status: "pending"
            }));
            expect(changeUserSenderToRealNameSpy).toHaveBeenCalledWith(expect.any(String), mockUser.id);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(result).toEqual({
                status: "OK",
                code: HttpStatus.OK,
                description: "Ticket was created",
                data: { ...createdTicket, messages: mockTicket.messages }
            });
        });


        // ... tests for authentication, authorization, and error handling
    })

    describe("writeTicket", () => {
        // ... tests for authentication, authorization (non-owner, non-admin), closed ticket, deleted ticket, empty message, and successful message addition
    });

    describe("editTicket", () => {
        // ... tests for successful update and error handling
    });

    describe("changeUserSenderToRealName", () => {
        // ... tests for replacing "User" with the actual user's name and leaving "Support" unchanged
    });
});
