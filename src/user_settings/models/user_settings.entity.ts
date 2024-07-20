/* eslint-disable prettier/prettier */
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/models/user.entity";

@Entity("user_settings")
export class UserSettings {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, user => user.settings, { onDelete: "CASCADE" })
    user: User;

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
    display_lastname_on_public: boolean;

    @Column({ type: "boolean", default: false })
    display_email_on_public: boolean;
}
