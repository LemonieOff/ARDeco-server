/* eslint-disable prettier/prettier */
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/models/user.entity";

@Entity("ticket")
export class Ticket {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => User, user => user.galleries, { onDelete: "CASCADE" })
    @JoinColumn({
        name: "user_id",
        referencedColumnName: "id"
    })
    user: User;

    @Column({
        type: "int"
    })
    user_id: number; // The ID of the user that create the ticket

    @Column()
    status: string; // The status of the ticket (open, closed, in progress)

    @Column()
    title: string; // The title of the ticket

    @Column()
    description: string; // The description of the ticket

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    date: Date; // The date of the ticket

    @Column("longtext") // The messages of the ticket
    messages: string;
}
