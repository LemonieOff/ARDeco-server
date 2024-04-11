import { forwardRef, Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { join } from "path";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PaymentsModule } from "src/payments/payments.module";
import { PaymentsService } from "src/payments/payments.service";

@Module({
    imports: [
        forwardRef(() => PaymentsModule),
        ConfigModule
    ],
    providers: [MailService],
    exports: [MailService]
})
export class MailModule {}
