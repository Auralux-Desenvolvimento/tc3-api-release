import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength, validateOrReject } from "class-validator";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import EmailOperation from "./emailOperation";
import Moderator from "./moderator";
import Team from "./team";

@Entity("user")
export default class User {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID(4)
  @IsOptional()
  id: string;

  @Column("varchar", { length: 254 })
  @IsString({ message: "A name must be a string" })
  @MaxLength(254, { message: "A name must have a length of up to 254 characters" })
  name: string;

  @Column("varchar", { length: 254, unique: true })
  @IsString({ message: "An email must be a string" })
  @MaxLength(254, { message: "An email must have a length of up to 254 characters" })
  email: string;

  @Column("text")
  @IsString({ message: "A password must be a string" })
  password: string;

  @Column("boolean", { name: "is_verified", default: false })
  @IsBoolean({ message: "The user's 'isVerified' state must be a boolean" })
  @IsOptional()
  isVerified?: boolean;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  readonly createdAt: Date;

  @OneToMany(() => Team, team => team.user, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  teams: Team[];

  @OneToMany(() => Moderator, moderator => moderator.user, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  moderator: Moderator[];

  @OneToMany(() => EmailOperation, emailOperation => emailOperation.user, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  emailOperations: EmailOperation[];
  
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