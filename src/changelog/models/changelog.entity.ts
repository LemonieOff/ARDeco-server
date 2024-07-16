/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("changelog")
export class Changelog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    version: string;

    @Column()
    name: string; // The name

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    date: Date; // The date of the changelog

    @Column("longtext") // The text of the changelog
    changelog: string;
}
