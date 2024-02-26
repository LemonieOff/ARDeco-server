import { IsEmail, IsNotEmpty } from "@nestjs/class-validator"
import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("reset")
export class Reset {
    @PrimaryGeneratedColumn()
    id: number;

    @IsNotEmpty()
    @IsEmail()
    @Column()
    email : string

    @Column({unique : true})
    link : string
}
