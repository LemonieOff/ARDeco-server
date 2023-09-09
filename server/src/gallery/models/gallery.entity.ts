/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('gallery')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("int")
    user_id: number;

    @Column("boolean")
    visibility: boolean;

    @Column("json")
    furniture: string;

    @Column("string")
    name: string;

    @Column("string")
    description: string;

    @Column("string")
    room_type: string;
}
