import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ImageUser' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
