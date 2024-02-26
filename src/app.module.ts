/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { StatusModule } from "./status/status.module";
import { CatalogModule } from "./catalog/catalog.module";
import { CompanyModule } from "./company/company.module";
import { CartModule } from "./cart/cart.module";
import { MailModule } from "./mail/mail.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserSettingsModule } from "./user_settings/user_settings_module";
import { GalleryModule } from "./gallery/gallery.module";
import { PaymentsController } from "./payments/payments.controller";
import { PaymentsService } from "./payments/payments.service";
import { PaymentsModule } from "./payments/payments.module";
import { OrderHistoryModule } from "./order_history/order_history_module";
import { TicketModule } from "./ticket/ticket.module";
import { ArchiveModule } from "./archive/archive.module";
import { FavoriteFurnitureModule } from './favorite_furniture/favorite_furniture.module';
import { FavoriteGalleryModule } from './favorite_gallery/favorite_gallery.module';
import { BlockedUsersModule } from './blocked_users/blocked_users.module';

@Module({
    imports: [
        UserModule,
        TypeOrmModule.forRoot({
            type: "mysql",
            host: process.env.DB_HOST || "localhost",
            port: parseInt(process.env.DB_PORT) || 3306,
            username: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD || "root",
            database: process.env.DB_NAME || "ardeco",
            autoLoadEntities: true,
            entities: [],
            synchronize: true
        }),
        AuthModule,
        StatusModule,
        CatalogModule,
        CompanyModule,
        CartModule,
        UserSettingsModule,
        GalleryModule,
        OrderHistoryModule,
        ConfigModule.forRoot({
            isGlobal: true // no need to import into other modules
        }),
        //MailModule,
        //PaymentsModule,
        TicketModule,
        ArchiveModule,
        FavoriteFurnitureModule,
        FavoriteGalleryModule,
        BlockedUsersModule
    ],
    controllers: [AppController, /*PaymentsController*/],
    providers: [AppService, ConfigService]
})
export class AppModule {}
