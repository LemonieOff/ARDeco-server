import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogModule } from 'src/catalog/catalog.module';
import { MailModule } from 'src/mail/mail.module';
import { command } from './models/command.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [
    forwardRef(() => CatalogModule),
    forwardRef(() => MailModule),
    TypeOrmModule.forFeature([command]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService]
})
export class PaymentsModule {}
