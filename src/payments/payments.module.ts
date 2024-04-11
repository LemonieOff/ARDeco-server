import { forwardRef, Module } from '@nestjs/common';
import { CatalogModule } from 'src/catalog/catalog.module';
// import { MailModule } from 'src/mail/mail.module';
import { Command } from './models/command.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    forwardRef(() => CatalogModule),
    // forwardRef(() => MailModule),
    TypeOrmModule.forFeature([Command]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService]
})
export class PaymentsModule {}
