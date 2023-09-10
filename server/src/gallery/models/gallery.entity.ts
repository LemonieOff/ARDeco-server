/* eslint-disable prettier/prettier */
import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('gallery')
export class Gallery {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int", update: false})
    user_id: number;

    @Column({type: "boolean"})
    visibility: boolean;

    @Column({type: "json"})
    furniture: string;

    @Column({type: "string"})
    name: string;

    @Column({type: "string"})
    description: string;

    @Column({type: "string"})
    room_type: string;
}
