import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('catalog')
export class Catalog {
  @PrimaryGeneratedColumn()
  id: number; // Product ID

  @Column()
  name: string; // Product name

  @Column()
  price: number; // in euro cents

  @Column()
  styles: string; // JSON array ["style1", "style2", "style3"]

  @Column()
  rooms: string; // JSON array ["room1", "room2", "room3"]

  @Column()
  width: number; // in cm

  @Column()
  height: number; // in cm

  @Column()
  depth: number; // in cm

  @Column()
  colors: string; // JSON array ["color1", "color2", "color3"]

  @Column()
  number: number; // Partner ID

  @Column()
  model_id: number // 3D model ID in the model database

  @Column()
  active: boolean; // true if the product is active, false if it is not active

  @Column()
  company: number; // Company ID
}
