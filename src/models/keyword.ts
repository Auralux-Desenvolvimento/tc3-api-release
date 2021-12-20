import {IsOptional, IsString, IsUUID, MaxLength, validateOrReject } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn, OneToMany, BeforeInsert, BeforeUpdate, CreateDateColumn } from "typeorm";
import { v4 as uuid } from "uuid";
import PreferenceKeyword from "./preferenceKeyword";
import TeamKeyword from "./teamKeyword";

@Entity("keyword")
export default class Keyword {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID(4)
  @IsOptional()
  id: string;

  @Column("varchar")
  @IsString({ message: "A keyword's name must be a string" })
  @MaxLength(200, { message: "A keyword's name must have a length of up to 200 characters" })
  name: string;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  readonly createdAt: Date;

  @OneToMany(() => TeamKeyword, teamKeyword => teamKeyword.keyword, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  teamKeyword: TeamKeyword[];

  @OneToMany(() => PreferenceKeyword, preferenceKeyword => preferenceKeyword.keyword, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  preferenceKeyword: PreferenceKeyword[];

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