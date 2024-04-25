import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: ["error", "warn", "debug", "log", "verbose"]
    });
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    app.enableCors({
        origin: [
            "http://localhost:3000",
            "https://ardeco.app",
            "https://api.ardeco.app",
            "https://support.ardeco.app",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    });
    app.useStaticAssets(join(__dirname, '..', 'profile_pictures'), {
        prefix: '/profile_pictures/',
    });
    await app.listen(8000);
}

bootstrap();
