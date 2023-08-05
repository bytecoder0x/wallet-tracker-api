import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  email: string | null;

  @Column({ nullable: true })
  password: string | null;

  // lowercase, only for siwe users
  @Column({ unique: true, nullable: true })
  address: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
