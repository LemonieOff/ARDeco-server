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

    @Column({ type: "boolean", default: false })
    dark_mode: boolean;

    @Column({ type: "boolean", default: false })
    automatic_new_gallery_share: boolean;

    @Column({ type: "boolean", default: false })
    display_surname_on_public: boolean;

    @Column({ type: "boolean", default: false })
    display_email_on_public: boolean;
}
