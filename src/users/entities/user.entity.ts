import { Exclude } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ length: 50 })
  userName!: string;

  @Exclude()
  @Column({ select: false })
  password!: string;

  @Column({ type: 'varchar', length: 10, default: 'user' })
  role!: 'admin' | 'user';

  @CreateDateColumn()
  createdAt!: Date;
}
