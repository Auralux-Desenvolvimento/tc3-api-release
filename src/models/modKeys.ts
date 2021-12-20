import {IsUUID, validateOrReject } from "class-validator";
import {Entity, BeforeInsert, BeforeUpdate, JoinColumn, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne, OneToOne } from "typeorm";
import {v4 as uuid} from "uuid";
import Moderator from "./moderator";

@Entity("mod_keys")
export default class ModKeys {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID(4)
  id: string;

  @ManyToOne(() => Moderator, moderator => moderator.issuedKeys, { onDelete: "NO ACTION", onUpdate: "CASCADE" })
  @JoinColumn({ name: "issuer_id" })
  issuer: Moderator;

  @OneToOne(() => Moderator, moderator => moderator.modKey, { onDelete: "NO ACTION", onUpdate: "CASCADE" })
  moderator: Moderator;

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