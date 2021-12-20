import { IsUUID, IsString, MaxLength, validateOrReject, IsOptional } from "class-validator";
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, OneToMany } from "typeorm";
import {v4 as uuid} from "uuid";
import State from "./state";

@Entity("country")
export default class Country {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID(4)
  @IsOptional()
  id: string;

  @Column("varchar", { length: 254 })
  @IsString({ message: "The country name must be a string"})
  @MaxLength(254, { message: "The country name mustn't be longer than 45 characters" })
  name: string;

  @OneToMany(() => State, state => state.country, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  states: State[];

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