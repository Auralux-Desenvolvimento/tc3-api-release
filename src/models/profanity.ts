import { IsString, validateOrReject } from "class-validator";
import { Entity, BeforeInsert, BeforeUpdate, PrimaryColumn } from "typeorm";

@Entity("profanity")
export default class Profanity {
  @PrimaryColumn({ type: "varchar" })
  @IsString({ message: "A profanity name needs to be a string" })
  name: string;

  @BeforeInsert()
  @BeforeUpdate()
  async validate () {
    await validateOrReject(this);
  }
}