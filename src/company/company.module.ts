import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CompanyController } from "./company.controller";
import { UserService } from "../user/user.service";
import { User } from "../user/models/user.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
            secret: "secret"
        })
    ],
    controllers: [CompanyController],
    providers: [UserService],
    exports: [UserService]
})
export class CompanyModule {}
