import { IsUUID, IsEnum, validateOrReject, IsBoolean, IsDate } from "class-validator";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import User from "./user";

export enum OperationType {
  email = "email",
  password = "password"
}

@Entity("email_operation")
export default class EmailOperation {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID(4)
  id: string;

  @ManyToOne(() => User, user => user.emailOperations, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({
    type: "enum",
    enum: OperationType,
    name: "operation_type"
  })
  @IsEnum(OperationType, { message: "operationType must be one of two values: password or email" })
  operationType: OperationType;

  @Column({ type: "timestamp", name: "expiry_date" })
  @IsDate({ message: "expiryDate must be a Date" })
  expiryDate: Date;

  @Column("boolean", { default: true, name: 'is_valid' })
  @IsBoolean({ message: "isValid must be a boolean" })
  isValid: boolean;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  readonly createdAt: Date;

  constructor() {
    if(!this.id) {
      this.id = uuid();
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  async validate () {
    await validateOrReject(this);
  }
}