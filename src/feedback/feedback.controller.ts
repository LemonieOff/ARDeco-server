import { Body, Controller, Get, Post, Put, Req, Res } from "@nestjs/common";
import { FeedbackService } from "./feedback.service";
import { Request, Response } from "express";
import { Feedback } from "./models/feedback.entity";
import { User } from "../user/models/user.entity";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";

@Controller("feedbacks")
export class FeedbackController {
    constructor(
        private feedbackService: FeedbackService,
        private jwtService: JwtService,
        private userService: UserService
    ) {
    }

    @Post()
    async create(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
        @Body("feedback") feedback: string,
        @Body("type") type: string
    ): Promise<{
        status: string
        code: number;
        description: string;
        data: null | Feedback;
    }> {
        try {
            // Check feedback presence
            if (!feedback) {
                response.status(400);
                return {
                    code: 400,
                    data: null,
                    description: "Property 'feedback' is required",
                    status: "KO"
                };
            }

            // Check type presence
            if (type) {
                console.log("type " + type);
                // Check the type format
                if (!["feedback", "suggestion", "bug"].includes(type)) {
                    response.status(400);
                    return {
                        code: 400,
                        data: null,
                        description: "Property 'type' must be 'feedback', 'suggestion', 'bug' or not provided at all",
                        status: "KO"
                    };
                }
            } else {
                type = "feedback";
            }

            // Check authorization of access (user and gallery)
            const auth = await this.checkAuthorization(request);
            if (!Array.isArray(auth)) {
                response.status(auth.code);
                return auth;
            }
            const [user, _] = auth;

            // Make feedback object
            const feedbackObject: Feedback = new Feedback();
            feedbackObject.feedback = feedback;
            feedbackObject.type = type;
            feedbackObject.user = user;

            // Create the feedback and check if it has actually been created
            const feedbackCreated = await this.feedbackService.create(feedbackObject);
            if (!feedbackCreated) {
                response.status(501);
                return {
                    code: 501,
                    data: null,
                    description: "Error creating feedback",
                    status: "KO"
                };
            }

            response.status(201);
            return {
                code: 201,
                data: feedbackCreated,
                description: `Feedback created successfully`,
                status: "OK"
            };
        } catch (e) {
            response.status(501);
            return {
                code: 501,
                data: e,
                description: "Error creating feedback",
                status: "KO"
            };
        }
    }

    @Get()
    async getAll(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    ): Promise<{
        status: string;
        code: number;
        description: string;
        data: null | Feedback[];
    }> {
        try {
            // Check authorization of access (user and feedback)
            const auth = await this.checkAuthorization(request, "getAll");
            if (!Array.isArray(auth)) {
                response.status(auth.code);
                return auth;
            }

            // Retrieve all feedbacks
            const feedbacks = await this.feedbackService.all();

            response.status(200);
            return {
                code: 200,
                data: feedbacks,
                description: `Feedbacks retrieved successfully`,
                status: "OK"
            };
        } catch (e) {
            response.status(501);
            return {
                code: 501,
                data: e,
                description: "Error retrieving feedbacks",
                status: "KO"
            };
        }
    }

    @Get("processed")
    async getProcessed(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    ): Promise<{
        status: string;
        code: number;
        description: string;
        data: null | Feedback[];
    }> {
        try {
            // Check authorization of access (user and feedback)
            const auth = await this.checkAuthorization(request, "getProcessed");
            if (!Array.isArray(auth)) {
                response.status(auth.code);
                return auth;
            }

            // Retrieve all feedbacks
            const feedbacks = await this.feedbackService.allProcessed();

            response.status(200);
            return {
                code: 200,
                data: feedbacks,
                description: `Feedbacks retrieved successfully`,
                status: "OK"
            };
        } catch (e) {
            response.status(501);
            return {
                code: 501,
                data: e,
                description: "Error retrieving feedbacks",
                status: "KO"
            };
        }
    }

    @Get("unprocessed")
    async getUnprocessed(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    ): Promise<{
        status: string;
        code: number;
        description: string;
        data: null | Feedback[];
    }> {
        try {
            // Check authorization of access (user and feedback)
            const auth = await this.checkAuthorization(request, "getUnprocessed");
            if (!Array.isArray(auth)) {
                response.status(auth.code);
                return auth;
            }

            // Retrieve all feedbacks
            const feedbacks = await this.feedbackService.allUnprocessed();

            response.status(200);
            return {
                code: 200,
                data: feedbacks,
                description: `Feedbacks retrieved successfully`,
                status: "OK"
            };
        } catch (e) {
            response.status(501);
            return {
                code: 501,
                data: e,
                description: "Error retrieving feedbacks",
                status: "KO"
            };
        }
    }

    @Put("process/:id")
    async process(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    ): Promise<{
        status: string;
        code: number;
        description: string;
        data: null | Feedback;
    }> {
        try {
            // Check authorization of access (user and feedback)
            const auth = await this.checkAuthorization(request, "process", parseInt(request.params.id));
            if (!Array.isArray(auth)) {
                response.status(auth.code);
                return auth;
            }
            const [_, feedback] = auth;

            // Check feedback presence
            if (!feedback) {
                response.status(404);
                return {
                    code: 404,
                    data: null,
                    description: "Feedback not found",
                    status: "KO"
                };
            }

            if (feedback.processed) {
                response.status(409);
                return {
                    code: 409,
                    data: feedback,
                    description: "Feedback already processed",
                    status: "KO"
                };
            }

            // Process the feedback
            const feedbackProcessed = await this.feedbackService.process(feedback.id);
            if (!feedbackProcessed) {
                response.status(501);
                return {
                    code: 501,
                    data: null,
                    description: "Error processing feedback",
                    status: "KO"
                };
            }

            response.status(200);
            return {
                code: 200,
                data: feedbackProcessed,
                description: `Feedback processed successfully`,
                status: "OK"
            };
        } catch (e) {
            response.status(501);
            return {
                code: 501,
                data: e,
                description: "Error processing feedback",
                status: "KO"
            };
        }
    }

    @Put("unprocess/:id")
    async unprocess(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    ): Promise<{
        status: string;
        code: number;
        description: string;
        data: null | Feedback;
    }> {
        try {
            // Check authorization of access (user and feedback)
            const auth = await this.checkAuthorization(request, "unprocess", parseInt(request.params.id));
            if (!Array.isArray(auth)) {
                response.status(auth.code);
                return auth;
            }
            const [_, feedback] = auth;

            // Check feedback presence
            if (!feedback) {
                response.status(404);
                return {
                    code: 404,
                    data: null,
                    description: "Feedback not found",
                    status: "KO"
                };
            }

            if (!feedback.processed) {
                response.status(409);
                return {
                    code: 409,
                    data: feedback,
                    description: "Feedback already unprocessed",
                    status: "KO"
                };
            }

            // Unprocess the feedback
            const feedbackUnprocessed = await this.feedbackService.unprocess(feedback.id);
            if (!feedbackUnprocessed) {
                response.status(501);
                return {
                    code: 501,
                    data: null,
                    description: "Error unprocessing feedback",
                    status: "KO"
                };
            }

            response.status(200);
            return {
                code: 200,
                data: feedbackUnprocessed,
                description: `Feedback unprocessed successfully`,
                status: "OK"
            };
        } catch (e) {
            response.status(501);
            return {
                code: 501,
                data: e,
                description: "Error unprocessing feedback",
                status: "KO"
            };
        }
    }

    async checkAuthorization(
        req: Request,
        mode: string = "create",
        feedback_id: number = null
    ): Promise<{
        code: number;
        data: null;
        description: string;
        status: string
    } | [User, Feedback]> {
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;

        // Cookie or JWT not valid
        if (!cookie || !data) {
            return {
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            };
        }

        // User retrieving
        const user = await this.userService.findOne({ id: data["id"] });

        // User not found
        if (!user) {
            return {
                status: "KO",
                code: 403,
                description:
                    "You are not allowed to access/modify this resource",
                data: null
            };
        }

        // On "create" mode, feedback_id is ignored if provided, and every user can use this route
        if (mode === "create") {
            return [user, null];
        }

        // On other modes, the user must be an admin
        if (user.role !== "admin") {
            return {
                status: "KO",
                code: 403,
                description:
                    "You are not allowed to access/modify this resource",
                data: null
            };
        }

        // When feedback_id is provided, the feedback must be retrieved
        if (feedback_id !== null) {
            if (isNaN(feedback_id)) {
                return {
                    status: "KO",
                    code: 400,
                    description: "Invalid feedback ID",
                    data: null
                };
            }

            // Feedback retrieving
            const feedback = await this.feedbackService.findOne(feedback_id);

            // Feedback not found
            if (!feedback) {
                return {
                    status: "KO",
                    code: 404,
                    description: "Feedback not found",
                    data: null
                };
            }

            return [user, feedback];
        }

        return [user, null];
    }
}
