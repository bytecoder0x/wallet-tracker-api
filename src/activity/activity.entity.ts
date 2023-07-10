import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Wallet } from '../wallets/wallet.entity';

@Entity()
@Unique(['chain', 'hash'])
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Wallet, { onDelete: 'CASCADE' })
  wallet: Wallet;

  @Column()
  chain: string;

  @Column()
  hash: string;

  @Column({ type: 'int', nullable: true })
  blockNumber: number | null;

  @Column()
  timestamp: Date;

  @Column()
  from: string;

  @Column({ type: 'varchar', nullable: true })
  to: string | null;

  @Column()
  value: string;

  @Column({ type: 'varchar', nullable: true })
  gasUsed: string | null;

  @Column({ type: 'varchar', nullable: true })
  gasPrice: string | null;

  @Column({ type: 'varchar', nullable: true })
  method: string | null;

  @Column({ default: false })
  isError: boolean;

  @Column()
  source: 'explorer' | 'manual';

  @Column({ type: 'varchar', nullable: true })
  note: string | null;
}
