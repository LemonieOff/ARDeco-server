import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import { User } from "../../user/models/user.entity";

@Entity("cart")
export class Cart {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    capacity: number;

    @Column()
    catalogItems: string;

    @OneToOne(() => User, user => user.cart, { onDelete: "CASCADE" })
    @JoinColumn()
    user: User;
}
