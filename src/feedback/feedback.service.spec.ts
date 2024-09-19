import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Feedback } from "./models/feedback.entity";
import { FeedbackService } from "./feedback.service";
import { User } from "../user/models/user.entity";

describe("FeedbackService", () => {
    let service: FeedbackService;
    let feedbackRepository: Repository<Feedback>;

    const mockUser = new User();
    mockUser.id = 1;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FeedbackService,
                {
                    provide: getRepositoryToken(Feedback),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        delete: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<FeedbackService>(FeedbackService);
        feedbackRepository = module.get<Repository<Feedback>>(getRepositoryToken(Feedback));
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("all", () => {
        it("should return all feedbacks without user information", async () => {
            const mockFeedbacks = [
                { id: 1, feedback: "Feedback 1", user: mockUser },
                { id: 2, feedback: "Feedback 2", user: mockUser }
            ];
            jest.spyOn(feedbackRepository, "find").mockResolvedValue(mockFeedbacks as any);
            const result = await service.all();
            expect(result).toEqual([
                { id: 1, feedback: "Feedback 1" },
                { id: 2, feedback: "Feedback 2" }
            ]);
        });
    });

    describe("allProcessed", () => {
        it("should return all processed feedbacks without user information", async () => {
            const mockFeedbacks = [
                { id: 1, feedback: "Feedback 1", processed: true, user: mockUser },
                { id: 2, feedback: "Feedback 2", processed: true, user: mockUser }
            ];
            jest.spyOn(feedbackRepository, "find").mockResolvedValue(mockFeedbacks as any);
            const result = await service.allProcessed();
            expect(result).toEqual([
                { id: 1, feedback: "Feedback 1", processed: true },
                { id: 2, feedback: "Feedback 2", processed: true }
            ]);
        });
    });

    describe("allUnprocessed", () => {
        it("should return all unprocessed feedbacks without user information", async () => {
            const mockFeedbacks = [
                { id: 1, feedback: "Feedback 1", processed: false, user: mockUser },
                { id: 2, feedback: "Feedback 2", processed: false, user: mockUser }
            ];
            jest.spyOn(feedbackRepository, "find").mockResolvedValue(mockFeedbacks as any);
            const result = await service.allUnprocessed();
            expect(result).toEqual([
                { id: 1, feedback: "Feedback 1", processed: false },
                { id: 2, feedback: "Feedback 2", processed: false }
            ]);
        });
    });

    describe("findOne", () => {
        it("should return a feedback by ID", async () => {
            const feedbackId = 1;
            const mockFeedback = { id: feedbackId, feedback: "Feedback 1", user: mockUser };
            jest.spyOn(feedbackRepository, "findOne").mockResolvedValue(mockFeedback as any);
            const result = await service.findOne(feedbackId);
            expect(result).toEqual(mockFeedback);
        });
    });

    describe("create", () => {
        it("should create a new feedback and return it without user information", async () => {
            const data = { feedback: "New Feedback", type: "suggestion", user: mockUser };
            const newFeedback = { id: 1, ...data } as Feedback;
            jest.spyOn(feedbackRepository, "save").mockResolvedValue(newFeedback as any);
            const result = await service.create(data);
            expect(result).toEqual({ id: 1, feedback: "New Feedback", type: "suggestion" });
        });
    });

    describe("process", () => {
        it("should process a feedback", async () => {
            const feedbackId = 1;
            const mockFeedback = {
                id: feedbackId,
                feedback: "Feedback 1",
                processed: false,
                processed_date: null,
                user: mockUser
            } as Feedback;
            const processedFeedback = {
                ...mockFeedback,
                processed: true,
                processed_date: new Date()
            }
            jest.spyOn(feedbackRepository, "findOne").mockResolvedValue(mockFeedback);
            jest.spyOn(feedbackRepository, "save").mockResolvedValue(processedFeedback);
            const result = await service.process(feedbackId);
            expect(result).toEqual({
                id: feedbackId,
                feedback: "Feedback 1",
                processed: true,
                processed_date: expect.any(Date),
            });
        });
    });

    describe("unprocess", () => {
        it("should unprocess a feedback", async () => {
            const feedbackId = 1;
            const mockFeedback = {
                id: feedbackId,
                feedback: "Feedback 1",
                processed: true,
                processed_date: new Date(),
                user: mockUser
            } as Feedback;
            const unprocessedFeedback = {
                ...mockFeedback,
                processed: false,
                processed_date: null
            }
            jest.spyOn(feedbackRepository, "findOne").mockResolvedValue(mockFeedback);
            jest.spyOn(feedbackRepository, "save").mockResolvedValue(unprocessedFeedback);
            const result = await service.unprocess(feedbackId);
            expect(result).toEqual({
                id: feedbackId,
                feedback: "Feedback 1",
                processed: false,
                processed_date: null
            });
        });
    });

    describe("delete", () => {
        it("should delete a feedback by ID", async () => {
            const feedbackId = 1;
            jest.spyOn(feedbackRepository, "delete").mockResolvedValue({ affected: 1 } as any);
            const result = await service.delete(feedbackId);
            expect(result.affected).toBe(1);
        });
    });
});
