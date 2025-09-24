import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  Index,
  ValueTransformer,
} from 'typeorm';

const DecimalAsString: ValueTransformer = {
  to: (v?: string | number | null) => (v == null ? null : String(v)),
  from: (v: string | null) => v,
};

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', name: 'contentful_id', length: 64, unique: true, nullable: true })
  contentful_id!: string | null;

  @Column({ type: 'varchar', length: 64, unique: true, nullable: true })
  sku!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 128, nullable: true })
  name!: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  brand!: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  model!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 64, nullable: true })
  category!: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  color!: string | null;

  @Index()
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: DecimalAsString,
  })
  price!: string | null;

  @Column({ type: 'varchar', length: 3, nullable: true })
  currency!: string | null;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ type: 'boolean', name: 'is_deleted', default: false })
  isDeleted!: boolean;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'created_at', nullable: true })
  createdAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'updated_at', nullable: true })
  updatedAt!: Date | null;
}
