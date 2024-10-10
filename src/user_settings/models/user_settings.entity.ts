/* eslint-disable prettier/prettier */
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/models/user.entity";

@Entity("user_settings")
export class UserSettings {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, user => user.settings, { onDelete: "CASCADE" })
    @JoinColumn({
        name: "user_id",
        referencedColumnName: "id"
    })
    user: User;

    @Column({ type: "int" })
    user_id: number;

    @Column({ type: "boolean", default: false })
    automatic_new_gallery_share: boolean;

    @Column({ type: "boolean", default: false })
    display_lastname_on_public: boolean;

    @Column({ type: "boolean", default: false })
    display_email_on_public: boolean;
}
