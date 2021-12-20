import { IsUUID, IsString, MaxLength, validateOrReject, IsOptional } from "class-validator";
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import {v4 as uuid} from "uuid";
import Country from "./country";
import City from "./city";
import Preference from "./preference";

@Entity("state")
export default class State {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID(4)
  @IsOptional()
  id: string;

  @Column("varchar", { length: 254 })
  @IsString({ message: "The state name must be a string"})
  @MaxLength(254, { message: "A state name must have a length of up to 254 characters" })
  name: string;

  @ManyToOne(() => Country, country => country.states, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  @JoinColumn({ name: "country_id" })
  country: Country;

  @OneToMany(() => City, city => city.state, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  cities: City[];

  @OneToMany(() => Preference, preference => preference.state, { onDelete: "SET NULL", onUpdate: "CASCADE" })
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