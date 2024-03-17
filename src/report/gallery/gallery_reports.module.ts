import { Module } from '@nestjs/common';
import { GalleryReportsService } from './gallery_reports.service';
import { GalleryReportsController } from './gallery_reports.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { GalleryReport } from "./models/gallery_reports.entity";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../../user/user.module";
import { GalleryModule } from "../../gallery/gallery.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([GalleryReport]),
        GalleryModule,
        UserModule,
        JwtModule.register({
            secret: "secret",
            signOptions: { expiresIn: "1d" }
        })
    ],
    controllers: [GalleryReportsController],
    providers: [GalleryReportsService],
    exports: [GalleryReportsService]
})
export class GalleryReportsModule {}
