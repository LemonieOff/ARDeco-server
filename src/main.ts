import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AllExceptionsFilter, exceptionFactory } from "./exception_filters/all-exceptions.filter";


async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: ["fatal", "error", "warn", "debug", "log", "verbose"]
    });
    const httpAdapter = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
    app.useGlobalPipes(new ValidationPipe({
        exceptionFactory: exceptionFactory
    }));
    app.use(cookieParser());
    app.enableCors({
        origin: [
            "http://localhost:3000",
            "http://localhost:3001",
            "https://ardeco.app",
            "https://api.ardeco.app",
            "https://dashboard.ardeco.app"
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    });
    app.useStaticAssets(join(__dirname, "..", "profile_pictures"), {
        prefix: "/profile_pictures/"
    });
    await app.listen(8000);
}

bootstrap();
