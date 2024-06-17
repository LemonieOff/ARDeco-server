import { Module } from "@nestjs/common";
import { UserModule } from "src/user/user.module";
import { CreateCompanyController } from "./create-company.controller";
import { JwtModule } from "@nestjs/jwt";

@Module({
    controllers: [CreateCompanyController],
    imports: [
        UserModule,
        JwtModule.register({
            secret: "secret",
            signOptions: { expiresIn: "1d" }
        })
    ]
})
export class CreateCompanyModule {
}
