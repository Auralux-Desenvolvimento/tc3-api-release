import { IsUUID, validateOrReject } from "class-validator";
import { Entity, BeforeInsert, BeforeUpdate, JoinColumn, PrimaryGeneratedColumn, OneToMany, ManyToOne, OneToOne } from "typeorm";
import {v4 as uuid} from "uuid";
import ModKeys from "./modKeys";
import Post from "./post";
import Report from './report';
import User from "./user";

@Entity("moderator")
export default class Moderator {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID(4)
  id: string;

  @ManyToOne(() => User, user => user.moderator, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToOne(() => ModKeys, modKeys => modKeys.moderator, { onDelete: "NO ACTION", onUpdate: "CASCADE" })
  @JoinColumn({ name: "mod_key_id" })
  modKey: ModKeys;

  @OneToMany(() => ModKeys, modKeys => modKeys.issuer, { onDelete: "NO ACTION", onUpdate: "CASCADE" })
  issuedKeys: ModKeys[];

  @OneToMany(() => Post, posts => posts.moderator, { onDelete: "NO ACTION", onUpdate: "CASCADE" })
  posts: Post[];

  @OneToMany(() => Report, report => report.moderator, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  reports: Report[];

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