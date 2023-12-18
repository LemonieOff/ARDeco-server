import { Module } from '@nestjs/common';
import { FavoriteFurnitureService } from './favorite_furniture.service';
import { FavoriteFurnitureController } from './favorite_furniture.controller';

@Module({
  providers: [FavoriteFurnitureService],
  controllers: [FavoriteFurnitureController],
  exports: [FavoriteFurnitureController]
})
export class FavoriteFurnitureModule {}
