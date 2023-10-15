/* eslint-disable prettier/prettier */
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {UserModule} from './user/user.module';
import {AuthModule} from './auth/auth.module';
import {StatusModule} from './status/status.module';
import {CatalogModule} from "./catalog/catalog.module";
import {CompanyModule} from "./company/company.module";
import {CartModule} from './cart/cart.module';
import {MailModule} from './mail/mail.module';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {UserSettingsModule} from "./user_settings/user_settings_module";
import {GalleryModule} from "./gallery/gallery.module";
import {PaymentsController} from './payments/payments.controller';
import {PaymentsService } from './payments/payments.service';
import {PaymentsModule} from './payments/payments.module';

@Module({
    imports: [
        UserModule,
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
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
        CompanyModule,
        CartModule,
        UserSettingsModule,
        GalleryModule,
        ConfigModule.forRoot({
            isGlobal: true, // no need to import into other modules
        }),
        MailModule,
        PaymentsModule
    ],
    controllers: [AppController, PaymentsController],
    providers: [AppService, ConfigService, PaymentsService]
})
export class AppModule {
}
