import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToOne, JoinColumn } from "typeorm";
import { Catalog } from "../../catalog/models/catalog.entity";
import { User } from "../../user/models/user.entity";

@Entity('cart')
export class Cart {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    capacity: number;

    @Column()
    catalogItems: string;

    @OneToOne(() => User, user => user.cart)
    @JoinColumn()
    user: User;
}