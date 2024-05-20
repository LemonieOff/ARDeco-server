import { Test, TestingModule } from "@nestjs/testing";
import { AuthGuard } from "./auth.guard";
import { JwtService } from "@nestjs/jwt";
import { ExecutionContext } from "@nestjs/common";

describe("AuthGuard", () => {
    let authGuard: AuthGuard;
    let jwtService: JwtService;
    let mockRequest: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthGuard,
                {
                    provide: JwtService,
                    useValue: {
                        verify: jest.fn()
                    }
                }
            ]
        }).compile();

        authGuard = module.get<AuthGuard>(AuthGuard);
        jwtService = module.get<JwtService>(JwtService);

        mockRequest = {
            cookies: { jwt: "mockJwtToken" }
        };
    });

    it("should be defined", () => {
        expect(authGuard).toBeDefined();
    });

    describe("canActivate", () => {
        it("should return true if JWT is valid", async () => {
            const decodedToken = { userId: 1 };
            jest.spyOn(jwtService, "verify").mockReturnValue(decodedToken);

            const mockHttpArgumentsHost = {
                getRequest: jest.fn().mockReturnValue(mockRequest),
                getResponse: jest.fn(),
                getNext: jest.fn(),
            };

            const mockExecutionContext = {
                switchToHttp: () => mockHttpArgumentsHost
            } as unknown as ExecutionContext;

            const result = authGuard.canActivate(mockExecutionContext);
            expect(result).toBe(decodedToken);
            expect(jwtService.verify).toHaveBeenCalledWith("mockJwtToken");
        });

        it("should return false and log error if JWT is invalid", async () => {
            const consoleSpy = jest.spyOn(console, "log");
            jest.spyOn(jwtService, "verify").mockImplementation(() => {
                throw new Error("Invalid token");
            });

            const mockHttpArgumentsHost = {
                getRequest: jest.fn().mockReturnValue(mockRequest),
                getResponse: jest.fn(),
                getNext: jest.fn(),
            };

            const mockExecutionContext = {
                switchToHttp: () => mockHttpArgumentsHost
            } as unknown as ExecutionContext;

            const result = authGuard.canActivate(mockExecutionContext);
            expect(result).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith("Auth guard didn't pass");
        });

        it("should return false if no JWT token in cookies", async () => {
            const mockHttpArgumentsHost = {
                getRequest: jest.fn().mockReturnValue({}),
                getResponse: jest.fn(),
                getNext: jest.fn(),
            };

            const mockExecutionContext = {
                switchToHttp: () => mockHttpArgumentsHost
            } as unknown as ExecutionContext;
            const consoleSpy = jest.spyOn(console, "log");

            const result = authGuard.canActivate(mockExecutionContext);
            expect(result).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith("Auth guard didn't pass");
        });
    });
});
