import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    email: string;
    
    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column()
    phone: string;

    @Column()
    city: string;

    @Column()
    password: string;
}