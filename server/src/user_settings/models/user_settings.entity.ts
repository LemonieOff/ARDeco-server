/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("user_settings")
export class UserSettings {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, update: false, type: "int" })
    user_id: number;

    @Column({ type: "varchar", default: "fr" })
    language: string;

    @Column({ type: "boolean", default: true })
    notifications_enabled: boolean;

    @Column({ type: "boolean", default: true })
    sounds_enabled: boolean;
}
