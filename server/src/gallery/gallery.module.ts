import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Gallery} from './models/gallery.entity';
import {GalleryController} from './gallery.controller';
import {GalleryService} from './gallery.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Gallery]),
        JwtModule.register({
            secret: "secret",
            signOptions: {expiresIn: '1d'},
        }),
    ],
    controllers: [GalleryController],
    providers: [GalleryService],
    exports: [GalleryService]
})
export class GalleryModule {
}
