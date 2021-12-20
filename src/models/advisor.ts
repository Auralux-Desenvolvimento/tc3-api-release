import { IsOptional, IsString, IsUrl, IsUUID, MaxLength, MinLength, validateOrReject } from "class-validator";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import {v4 as uuid} from "uuid";
import Team from "./team";

@Entity("advisor")
export default class Advisor {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID(4)
  @IsOptional()
  id: string;

  @Column("varchar", { length: 254 })
  @IsString({ message: "The advisor name must be a string"})
  @MinLength(2, { message: "A name must be longer than 1 character" })
  @MaxLength(254, { message: "An advisor name must have a length of up to 254 characters" })
  name: string;

  @ManyToOne(() => Team, team => team.advisors, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  @JoinColumn({ name: "team_id" })
  team: Team;

  @Column("text", { name: "photo_url" })
  @IsString({ message: "The advisor photo url name must be a string"})
  @IsUrl({}, { message: "The advisor photo url name must be an URL" })
  @IsOptional()
  photoURL?: string|null;

  @Column("varchar", { length: 254, unique: true })
  @IsString({ message: "An email must be a string" })
  @MaxLength(254, { message: "An email must have a length of up to 254 characters" })
  email: string;

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