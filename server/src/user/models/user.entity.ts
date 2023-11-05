/* eslint-disable prettier/prettier */
import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import { Cart } from "../../cart/models/cart.entity";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    email: string;

    @Column()
    first_name: string; // First name for users, company name for companies

    @Column()
    last_name: string; // Last name for users, sub-company name (or company name if not) for companies

    @Column()
    phone: string;

    @Column()
    city: string;

    @Column()
    password: string;

    @Column({default: 0}) // 0 = false, 1 = true
    deleted: boolean;

    @Column({default: "client"})
    role: string; // client, company, admin

    @Column({nullable: true})
    company_api_key: string; // API key for company users, null for all other account types

    @OneToOne(() => Cart, cart => cart.user, {eager: true})
    @JoinColumn()
    cart: Cart;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    created: Date;
}