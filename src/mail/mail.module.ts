import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { forwardRef, Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { join } from "path";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MailController } from "./mail.controller";
import { PaymentsModule } from "src/payments/payments.module";
import { PaymentsService } from "src/payments/payments.service";

@Module({
    imports: [
        forwardRef(() => PaymentsModule),
        ConfigModule,
        MailerModule.forRootAsync({
            imports: [ConfigModule], // import module if not enabled globally
            useFactory: async (config: ConfigService) => ({
                transport: {
                    host: config.get("MAIL_HOST"),
                    port: parseInt(config.get("MAIL_PORT"), 10),
                    secure: false
                    //auth: {
                    //  user: config.get('MAIL_USER'),
                    //  pass: config.get('MAIL_PASSWORD'),
                    //},
                },
                defaults: {
                    from: `"No Reply" <${config.get("MAIL_FROM")}>`
                },
                preview: false,
                template: {
                    dir: join(__dirname, "../mail/templates"),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true
                    }
                }
            }),
            inject: [ConfigService]
        }),
    ],
    providers: [MailService],
    controllers: [MailController],
    exports: [MailService]
})
export class MailModule {}
