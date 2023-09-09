/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('user_settings')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    user_id: number;

    @Column()
    language: string;

    @Column()
    notifications_enabled: boolean;

    @Column()
    sounds_enabled: boolean;
}
