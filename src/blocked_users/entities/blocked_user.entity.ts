/* eslint-disable prettier/prettier */
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/models/user.entity";

@Entity("blocked_users")
export class BlockedUser {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => User, user => user.blocking, { onDelete: "CASCADE" })
    @JoinColumn({
        name: "user_id",
        referencedColumnName: "id"
    })
    user: User;

    @Column({ type: "int" })
    user_id: number;

    @ManyToOne(_ => User, user => user.blocked_by, { onDelete: "CASCADE" })
    @JoinColumn({
        name: "blocked_user_id",
        referencedColumnName: "id"
    })
    blocked_user: User;

    @Column({ type: "int" })
    blocked_user_id: number;
}
