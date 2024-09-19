import { Test, TestingModule } from "@nestjs/testing";
import { FeedbackController } from "./feedback.controller";
import { FeedbackService } from "./feedback.service";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { User } from "../user/models/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Feedback } from "./models/feedback.entity";

describe("FeedbackController", () => {
    let feedbackController: FeedbackController;
    let feedbackService: FeedbackService;
    let userService: UserService;
    let jwtService: JwtService;

    const req = { cookies: { jwt: "token" } } as any;
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FeedbackController],
            providers: [
                FeedbackService,
                UserService,
                {
                    provide: getRepositoryToken(Feedback),
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

        feedbackController = module.get<FeedbackController>(FeedbackController);
        feedbackService = module.get<FeedbackService>(FeedbackService);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it("should be defined", () => {
        expect(feedbackController).toBeDefined();
    });

    describe("create", () => {
        it("should return 400 if feedback is missing", async () => {
            const result = await feedbackController.create(req, res, "", "feedback");
            expect(res.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "Property 'feedback' is required",
                data: null
            });
        });

        it("should return 400 if type is invalid", async () => {
            const result = await feedbackController.create(req, res, "This is a feedback", "invalid type");
            expect(res.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "Property 'type' must be 'feedback', 'suggestion', 'bug' or not provided at all",
                data: null
            });
        });

        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as any;
            const result = await feedbackController.create(req, res, "This is a feedback", "feedback");
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should create a feedback and return 201", async () => {
            const feedback = "This is a feedback";
            const type = "feedback";
            const mockUser = { id: 1 } as User;
            const mockFeedback = { id: 1, feedback, type, user_id: mockUser.id } as Feedback;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(feedbackService, "create").mockResolvedValue(mockFeedback);
            const result = await feedbackController.create(req, res, feedback, type);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(result).toEqual({
                status: "OK",
                code: 201,
                description: "Feedback created successfully",
                data: mockFeedback
            });
        });

        it("should create a feedback and return 201 if type is missing and set it to feedback", async () => {
            const feedback = "This is a feedback";
            const mockUser = { id: 1 } as User;
            const mockFeedback = { id: 1, feedback, user_id: mockUser.id } as Feedback;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(feedbackService, "create").mockResolvedValue({ ...mockFeedback, type: "feedback" });
            const result = await feedbackController.create(req, res, feedback, undefined);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(result).toEqual({
                status: "OK",
                code: 201,
                description: "Feedback created successfully",
                data: { ...mockFeedback, type: "feedback" }
            });
            expect(result.data.type).toEqual("feedback");
        });

        it("should return 501 if there is an error while creating the feedback", async () => {
            const feedback = "This is a feedback";
            const type = "feedback";
            const mockUser = { id: 1 } as User;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(feedbackService, "create").mockResolvedValue(null);
            const result = await feedbackController.create(req, res, feedback, type);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                status: "KO",
                code: 501,
                description: "Error creating feedback",
                data: null
            });
        });

        it("should return 501 if there is an error generally while creating the feedback", async () => {
            const feedback = "This is a feedback";
            const error = new Error("Test error while creating the feedback");
            jest.spyOn(feedbackController, "checkAuthorization").mockImplementation(() => {
                throw error;
            });
            const result = await feedbackController.create(req, res, feedback, undefined);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                status: "KO",
                code: 501,
                description: "Error creating feedback",
                data: error
            });
        });
    });

    describe("getAll", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as any;
            const result = await feedbackController.getAll(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if user is not admin", async () => {
            const mockUser = { id: 1, role: "client" } as User;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            const result = await feedbackController.getAll(req, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return all feedbacks and 200 if user is admin", async () => {
            const mockUser = { id: 1, role: "admin" } as User;
            const mockFeedbacks = [{ id: 1, feedback: "feedback1" }, { id: 2, feedback: "feedback2" }] as Feedback[];
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(feedbackService, "all").mockResolvedValue(mockFeedbacks);
            const result = await feedbackController.getAll(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Feedbacks retrieved successfully",
                data: mockFeedbacks
            });
        });

        it("should return 501 if there is an error", async () => {
            const error = new Error("Test error while creating the feedback");
            jest.spyOn(feedbackController, "checkAuthorization").mockImplementation(() => {
                throw error;
            });
            const result = await feedbackController.getAll(req, res);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                status: "KO",
                code: 501,
                description: "Error retrieving feedbacks",
                data: error
            });
        });
    });

    describe("getProcessed", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as any;
            const result = await feedbackController.getProcessed(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if user is not admin", async () => {
            const mockUser = { id: 1, role: "client" } as User;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            const result = await feedbackController.getProcessed(req, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return all processed feedbacks and 200 if user is admin", async () => {
            const mockUser = { id: 1, role: "admin" } as User;
            const mockFeedbacks = [{ id: 1, feedback: "feedback1", processed: true }, {
                id: 2,
                feedback: "feedback2",
                processed: true
            }] as Feedback[];
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(feedbackService, "allProcessed").mockResolvedValue(mockFeedbacks);
            const result = await feedbackController.getProcessed(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Feedbacks retrieved successfully",
                data: mockFeedbacks
            });
        });

        it("should return 501 if there is an error", async () => {
            const error = new Error("Test error while creating the feedback");
            jest.spyOn(feedbackController, "checkAuthorization").mockImplementation(() => {
                throw error;
            });
            const result = await feedbackController.getProcessed(req, res);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                status: "KO",
                code: 501,
                description: "Error retrieving feedbacks",
                data: error
            });
        });
    });

    describe("getUnprocessed", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as any;
            const result = await feedbackController.getUnprocessed(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if user is not admin", async () => {
            const mockUser = { id: 1, role: "client" } as User;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            const result = await feedbackController.getUnprocessed(req, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return all unprocessed feedbacks and 200 if user is admin", async () => {
            const mockUser = { id: 1, role: "admin" } as User;
            const mockFeedbacks = [{ id: 1, feedback: "feedback1", processed: false }, {
                id: 2,
                feedback: "feedback2",
                processed: false
            }] as Feedback[];
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(feedbackService, "allUnprocessed").mockResolvedValue(mockFeedbacks);
            const result = await feedbackController.getUnprocessed(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Feedbacks retrieved successfully",
                data: mockFeedbacks
            });
        });

        it("should return 501 if there is an error", async () => {
            const error = new Error("Test error while creating the feedback");
            jest.spyOn(feedbackController, "checkAuthorization").mockImplementation(() => {
                throw error;
            });
            const result = await feedbackController.getUnprocessed(req, res);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                status: "KO",
                code: 501,
                description: "Error retrieving feedbacks",
                data: error
            });
        });
    });

    describe("process", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {}, params: { id: 1 } } as any;
            const result = await feedbackController.process(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if user is not admin", async () => {
            const mockUser = { id: 1, role: "client" } as User;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            const req = { cookies: { jwt: "token" }, params: { id: 1 } } as any;
            const result = await feedbackController.process(req, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 404 if feedback is not found", async () => {
            const mockUser = { id: 1, role: "admin" } as User;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(feedbackService, "findOne").mockResolvedValue(null);
            const req = { cookies: { jwt: "token" }, params: { id: 1 } } as any;
            const result = await feedbackController.process(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Feedback not found",
                data: null
            });
        });

        it("should return 409 if feedback is already processed", async () => {
            const mockUser = { id: 1, role: "admin" } as User;
            const mockFeedback = { id: 1, feedback: "feedback1", processed: true } as Feedback;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(feedbackService, "findOne").mockResolvedValue(mockFeedback);
            const req = { cookies: { jwt: "token" }, params: { id: 1 } } as any;
            const result = await feedbackController.process(req, res);
            expect(res.status).toHaveBeenCalledWith(409);
            expect(result).toEqual({
                status: "KO",
                code: 409,
                description: "Feedback already processed",
                data: mockFeedback
            });
        });

        it("should process feedback and return 200", async () => {
            const mockUser = { id: 1, role: "admin" } as User;
            const mockFeedback = { id: 1, feedback: "feedback1", processed: false } as Feedback;
            const mockProcessedFeedback = {
                id: 1,
                feedback: "feedback1",
                processed: true,
                processed_date: new Date()
            } as Feedback;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(feedbackService, "findOne").mockResolvedValue(mockFeedback);
            jest.spyOn(feedbackService, "process").mockResolvedValue(mockProcessedFeedback);
            const req = { cookies: { jwt: "token" }, params: { id: 1 } } as any;
            const result = await feedbackController.process(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Feedback processed successfully",
                data: mockProcessedFeedback
            });
        });

        it("should return 501 if there is an error processing the feedback", async () => {
            const mockUser = { id: 1, role: "admin" } as User;
            const mockFeedback = { id: 1, feedback: "feedback1", processed: false } as Feedback;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(feedbackService, "findOne").mockResolvedValue(mockFeedback);
            jest.spyOn(feedbackService, "process").mockResolvedValue(null);
            const req = { cookies: { jwt: "token" }, params: { id: 1 } } as any;
            const result = await feedbackController.process(req, res);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                status: "KO",
                code: 501,
                description: "Error processing feedback",
                data: null
            });
        });

        it("should return 501 if there is an error", async () => {
            const error = new Error("Test error while creating the feedback");
            jest.spyOn(feedbackController, "checkAuthorization").mockImplementation(() => {
                throw error;
            });
            const req = { cookies: { jwt: "token" }, params: { id: 1 } } as any;
            const result = await feedbackController.process(req, res);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                status: "KO",
                code: 501,
                description: "Error processing feedback",
                data: error
            });
        });
    });

    describe("unprocess", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {}, params: { id: 1 } } as any;
            const result = await feedbackController.unprocess(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if user is not admin", async () => {
            const mockUser = { id: 1, role: "client" } as User;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            const req = { cookies: { jwt: "token" }, params: { id: 1 } } as any;
            const result = await feedbackController.unprocess(req, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 404 if feedback is not found", async () => {
            const mockUser = { id: 1, role: "admin" } as User;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(feedbackService, "findOne").mockResolvedValue(null);
            const req = { cookies: { jwt: "token" }, params: { id: 1 } } as any;
            const result = await feedbackController.unprocess(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Feedback not found",
                data: null
            });
        });

        it("should return 409 if feedback is already unprocessed", async () => {
            const mockUser = { id: 1, role: "admin" } as User;
            const mockFeedback = { id: 1, feedback: "feedback1", processed: false } as Feedback;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(feedbackService, "findOne").mockResolvedValue(mockFeedback);
            const req = { cookies: { jwt: "token" }, params: { id: 1 } } as any;
            const result = await feedbackController.unprocess(req, res);
            expect(res.status).toHaveBeenCalledWith(409);
            expect(result).toEqual({
                status: "KO",
                code: 409,
                description: "Feedback already unprocessed",
                data: mockFeedback
            });
        });

        it("should unprocess feedback and return 200", async () => {
            const mockUser = { id: 1, role: "admin" } as User;
            const mockFeedback = {
                id: 1,
                feedback: "feedback1",
                processed: true,
                processed_date: new Date()
            } as Feedback;
            const mockUnprocessedFeedback = {
                id: 1,
                feedback: "feedback1",
                processed: false,
                processed_date: null
            } as Feedback;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(feedbackService, "findOne").mockResolvedValue(mockFeedback);
            jest.spyOn(feedbackService, "unprocess").mockResolvedValue(mockUnprocessedFeedback);
            const req = { cookies: { jwt: "token" }, params: { id: 1 } } as any;
            const result = await feedbackController.unprocess(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Feedback unprocessed successfully",
                data: mockUnprocessedFeedback
            });
        });

        it("should return 501 if there is an error unprocessing the feedback", async () => {
            const mockUser = { id: 1, role: "admin" } as User;
            const mockFeedback = { id: 1, feedback: "feedback1", processed: true } as Feedback;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(feedbackService, "findOne").mockResolvedValue(mockFeedback);
            jest.spyOn(feedbackService, "unprocess").mockResolvedValue(null);
            const req = { cookies: { jwt: "token" }, params: { id: 1 } } as any;
            const result = await feedbackController.unprocess(req, res);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                status: "KO",
                code: 501,
                description: "Error unprocessing feedback",
                data: null
            });
        });

        it("should return 501 if there is an error", async () => {
            const error = new Error("Test error while creating the feedback");
            jest.spyOn(feedbackController, "checkAuthorization").mockImplementation(() => {
                throw error;
            });
            const req = { cookies: { jwt: "token" }, params: { id: 1 } } as any;
            const result = await feedbackController.unprocess(req, res);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                status: "KO",
                code: 501,
                description: "Error unprocessing feedback",
                data: error
            });
        });
    });

    describe("delete", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {}, params: { id: 1 } } as any;
            const result = await feedbackController.delete(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if user is not admin", async () => {
            const mockUser = { id: 1, role: "client" } as User;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            const req = { cookies: { jwt: "token" }, params: { id: 1 } } as any;
            const result = await feedbackController.delete(req, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return 404 if feedback is not found", async () => {
            const mockUser = { id: 1, role: "admin" } as User;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(feedbackService, "findOne").mockResolvedValue(null);
            const req = { cookies: { jwt: "token" }, params: { id: 1 } } as any;
            const result = await feedbackController.delete(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Feedback not found",
                data: null
            });
        });

        it("should delete feedback and return 200", async () => {
            const mockUser = { id: 1, role: "admin" } as User;
            const mockFeedback = { id: 1, feedback: "feedback1", processed: false } as Feedback;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(feedbackService, "findOne").mockResolvedValue(mockFeedback);
            jest.spyOn(feedbackService, "delete").mockResolvedValue({ affected: 1 } as any);
            const req = { cookies: { jwt: "token" }, params: { id: 1 } } as any;
            const result = await feedbackController.delete(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Feedback deleted successfully",
                data: mockFeedback
            });
        });

        it("should return 501 if there is an error deleting the feedback", async () => {
            const mockUser = { id: 1, role: "admin" } as User;
            const mockFeedback = { id: 1, feedback: "feedback1", processed: false } as Feedback;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(feedbackService, "findOne").mockResolvedValue(mockFeedback);
            jest.spyOn(feedbackService, "delete").mockResolvedValue({ affected: 0 } as any);
            const req = { cookies: { jwt: "token" }, params: { id: 1 } } as any;
            const result = await feedbackController.delete(req, res);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                status: "KO",
                code: 501,
                description: "Error deleting feedback",
                data: mockFeedback
            });
        });

        it("should return 501 if there is an error", async () => {
            const error = new Error("Test error while creating the feedback");
            jest.spyOn(feedbackController, "checkAuthorization").mockImplementation(() => {
                throw error;
            });
            const req = { cookies: { jwt: "token" }, params: { id: 1 } } as any;
            const result = await feedbackController.delete(req, res);
            expect(res.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                status: "KO",
                code: 501,
                description: "Error deleting feedback",
                data: error
            });
        });
    });

    describe("checkAuthorization", () => {
        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as any;
            const result = await feedbackController["checkAuthorization"](req, res);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue(null);
            const result = await feedbackController["checkAuthorization"](req, res);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return user and null feedback if mode is create", async () => {
            const mockUser = { id: 1, role: "client" } as User;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            const result = await feedbackController["checkAuthorization"](req, "create", 1);
            expect(result).toEqual([mockUser, null]);
        });

        it("should return 403 if mode is not create and user is not admin", async () => {
            const mockUser = { id: 1, role: "client" } as User;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            const result = await feedbackController["checkAuthorization"](req, "getAll");
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this resource",
                data: null
            });
        });

        it("should return user and null feedback if mode is not create, user is admin and feedback_id is not provided", async () => {
            const mockUser = { id: 1, role: "admin" } as User;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            const result = await feedbackController["checkAuthorization"](req, "getAll");
            expect(result).toEqual([mockUser, null]);
        });

        it("should return 400 if feedback_id is not a number", async () => {
            const mockUser = { id: 1, role: "admin" } as User;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            const result = await feedbackController["checkAuthorization"](req, "process", "invalid id" as any);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "Invalid feedback ID",
                data: null
            });
        });

        it("should return 404 if feedback is not found", async () => {
            const mockUser = { id: 1, role: "admin" } as User;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(feedbackService, "findOne").mockResolvedValue(null);
            const result = await feedbackController["checkAuthorization"](req, "process", 1);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Feedback not found",
                data: null
            });
        });

        it("should return user and feedback if mode is not create, user is admin and feedback is found", async () => {
            const mockUser = { id: 1, role: "admin" } as User;
            const mockFeedback = { id: 1, feedback: "feedback1" } as Feedback;
            jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
            jest.spyOn(feedbackService, "findOne").mockResolvedValue(mockFeedback);
            const result = await feedbackController["checkAuthorization"](req, "process", 1);
            expect(result).toEqual([mockUser, mockFeedback]);
        });
    });
});
