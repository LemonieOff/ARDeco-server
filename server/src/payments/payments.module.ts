import { Module } from '@nestjs/common';
import { MailModule } from 'src/mail/mail.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Command } from "./models/command.entity";

@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([Command])
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService]
})
export class PaymentsModule {}
