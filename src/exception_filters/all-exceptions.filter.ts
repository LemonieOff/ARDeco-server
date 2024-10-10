import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

export const exceptionFactory = (error = []) => {
    console.log(error);
    return new BadRequestException(error.map((err) => ({
        field: err.property,
        error: Object.values(err.constraints).join(", ")
    })));
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) {
    }

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;

        const ctx = host.switchToHttp();

        let code: number = HttpStatus.INTERNAL_SERVER_ERROR;
        let description: string = "Unknown error";
        let data: any | null = null;

        if (exception instanceof HttpException) {
            code = exception.getStatus();
            description = exception.message;
            data = exception.getResponse();
        }

        httpAdapter.reply(ctx.getResponse(), {
            status: "KO",
            code: code,
            description: description,
            data: data
        }, code);
    }
}
