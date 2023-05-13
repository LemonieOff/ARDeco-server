import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('catalog')
export class Catalog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  styles: string; // JSON array ["style1", "style2", "style3"]

  @Column()
  rooms: string; // JSON array ["room1", "room2", "room3"]

  @Column()
  width: number;

  @Column()
  height: number;

  @Column()
  depth: number;

  @Column()
  colors: string; // JSON array ["color1", "color2", "color3"]

  @Column()
  number: number; // Partner ID

  @Column()
  model_id: number // 3D model ID in the model database
}
