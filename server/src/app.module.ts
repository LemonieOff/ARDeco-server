import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import {StatusModule} from "./status/status.module";
import { CatalogModule } from "./catalog/catalog.module";
import { CompanyModule } from "./company/company.module";

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'db',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'admin',
      autoLoadEntities: true,
      entities: [],
      synchronize: true,
    }),
    AuthModule,
    StatusModule,
    CatalogModule,
    CompanyModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
