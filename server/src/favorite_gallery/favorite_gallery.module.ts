import { Module } from '@nestjs/common';
import { FavoriteGalleryController } from './favorite_gallery.controller';
import { FavoriteGalleryService } from './favorite_gallery.service';

@Module({
  controllers: [FavoriteGalleryController],
  providers: [FavoriteGalleryService],
  exports: [FavoriteGalleryService]
})
export class FavoriteGalleryModule {}
