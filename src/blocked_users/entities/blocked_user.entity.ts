/* eslint-disable prettier/prettier */
import {
    Column,
    Entity,
    PrimaryGeneratedColumn
} from "typeorm";

@Entity("blocked_users")
export class BlockedUser {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "int" })
    user_id: number;

    @Column({ type: "int" })
    blocked_user_id: number;
}
