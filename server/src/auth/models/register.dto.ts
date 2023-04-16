import { IsEmail, IsNotEmpty } from "class-validator"

export class RegisterDto {
    @IsNotEmpty()
    @IsEmail()
    email : string
    
    @IsNotEmpty()
    password : string
    
    @IsNotEmpty()
    password_confirm : string
    
    @IsNotEmpty()
    first_name : string
    
    @IsNotEmpty()
    city : string
    
    @IsNotEmpty()
    last_name : string
    
    @IsNotEmpty()
    phone : string
}