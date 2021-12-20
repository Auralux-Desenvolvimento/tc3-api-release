import {IsObject, IsString, IsUUID, MaxLength, validateOrReject } from "class-validator";
import {Entity, BeforeInsert, BeforeUpdate, JoinColumn, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import {v4 as uuid} from "uuid";
import Moderator from "./moderator";
import IDraftContent from "../types/portfolio/IDraftContent";

@Entity("post")
export default class Post {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID(4)
  id: string;

  @ManyToOne(() => Moderator, moderator => moderator.posts, { onDelete: "NO ACTION", onUpdate: "CASCADE" })
  @JoinColumn({ name: "moderator_id" })
  moderator: Moderator;

  @Column("varchar", { length: 254 })
  @IsString({ message: "A title must be a string" })
  @MaxLength(254, { message: "A title must have a length of up to 254 characters" })
  title: string;
  
  @Column("json")
  @IsObject({ message: "A post content must be an object" })
  content: IDraftContent;

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