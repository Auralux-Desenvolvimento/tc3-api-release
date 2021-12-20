import { IsUUID, IsString, MaxLength, validateOrReject, IsOptional } from "class-validator";
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import {v4 as uuid} from "uuid";
import Preference from "./preference";
import State from "./state";
import Team from "./team";

@Entity("city")
export default class City {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID(4)
  @IsOptional()
  id: string;

  @Column("varchar", { length: 254 })
  @IsString({ message: "The city name must be a string"})
  @MaxLength(254, { message: "A city name must have a length of up to 254 characters" })
  name: string;

  @ManyToOne(() => State, state => state.cities, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  @JoinColumn({ name: "state_id" })
  state: State;

  @OneToMany(() => Team, team => team.city, { onDelete: "SET NULL", onUpdate: "CASCADE" })
  teams: Team[];

  @OneToMany(() => Preference, preference => preference.city, { onDelete: "SET NULL", onUpdate: "CASCADE" })
  preferences: Preference[];
  
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