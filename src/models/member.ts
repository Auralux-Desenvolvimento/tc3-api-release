import { IsUUID, IsString, MaxLength, validateOrReject, IsOptional, IsUrl, IsDate, MinLength } from "class-validator";
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";
import {v4 as uuid} from "uuid";
import { MinAge } from "../utils/decorators/minAge";
import Team from './team';

@Entity("member")
export default class Member {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID(4)
  @IsOptional()
  id: string;

  @Column("varchar", { length: 254 })
  @IsString({ message: "The member name must be a string"})
  @MinLength(2, { message: "A name must be longer than 1 character" })
  @MaxLength(254, { message: "A member name must have a length of up to 254 characters" })
  name: string;

  @ManyToOne(() => Team, team => team.members, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  @JoinColumn({ name: "team_id" })
  team: Team;

  @Column("text", { name: "photo_url" })
  @IsString({ message: "The member photo url name must be a string"})
  @IsUrl({}, { message: "The member photo url name must be an URL" })
  @IsOptional()
  photoURL?: string|null;

  @Column("varchar", { length: 45 })
  @IsString({ message: "The member role must be a string"})
  @MaxLength(45, { message: "A member role must have a length of up to 45 characters" })
  role: string;

  @Column("varchar", { length: 254 })
  @IsString({ message: "The member description must be a string"})
  @MaxLength(254, { message: "A member description must have a length of up to 254 characters" })
  @IsOptional()
  description?: string|null;

  @Column("date")
  @IsDate({ message: "A member birthday must have a length of up to 254 characters" })
  @MinAge(15, { message: "A member cannot be younger than 15 years" })
  birthday: Date;

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