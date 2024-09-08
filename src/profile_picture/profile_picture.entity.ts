import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/models/user.entity";

@Entity("profile_picture")
export class ProfilePicture {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    filename: string;

    // TODO : One to Many with User
    /*@OneToMany(type => User, (user) => user.profile_picture)
    users: User[]*/
}
