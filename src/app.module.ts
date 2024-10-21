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
import { OrderHistoryModule } from "./order/order.module";
import { TicketModule } from "./ticket/ticket.module";
import { ArchiveModule } from "./archive/archive.module";
import { FavoriteFurnitureModule } from "./favorite_furniture/favorite_furniture.module";
import { FavoriteGalleryModule } from "./favorite_gallery/favorite_gallery.module";
import { BlockedUsersModule } from "./blocked_users/blocked_users.module";
import { GalleryReportsModule } from "./report/gallery/gallery_reports.module";
import { ProfilePictureModule } from "./profile_picture/profile_picture.module";
import { CreateCompanyModule } from "./create-company/create-company.module";
import { CommentModule } from "./comment/comment.module";
import { FeedbackModule } from "./feedback/feedback.module";
import { ChangelogModule } from "./changelog/changelog.module";
import { LikeModule } from "./like/like.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // no need to import into other modules
            cache: true,
            envFilePath: [".env", ".env.misc"],
            expandVariables: true
        }),
        TypeOrmModule.forRoot({
            type: "mysql",
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            autoLoadEntities: true,
            synchronize: false
        }),
        UserModule,
        AuthModule,
        StatusModule,
        CatalogModule,
        CompanyModule,
        CartModule,
        UserSettingsModule,
        GalleryModule,
        OrderHistoryModule,
        MailModule,
        //PaymentsModule,
        TicketModule,
        ArchiveModule,
        FavoriteFurnitureModule,
        FavoriteGalleryModule,
        BlockedUsersModule,
        GalleryReportsModule,
        ProfilePictureModule,
        CreateCompanyModule,
        CommentModule,
        FeedbackModule,
        ChangelogModule,
        LikeModule
    ],
    controllers: [AppController],
    providers: [AppService, ConfigService]
})
export class AppModule {
}
