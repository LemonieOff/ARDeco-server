/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("ticket")
export class Ticket {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_init_id: number; // The ID of the user that create the ticket

    @Column()
    status: string; // The status of the ticket (open, closed, in progress)

    @Column()
    title: string; // The title of the ticket

    @Column()
    description: string; // The description of the ticket

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    date: Date; // The date of the ticket

    @Column("longtext") // The messages of the ticket
    messages: string;
}
