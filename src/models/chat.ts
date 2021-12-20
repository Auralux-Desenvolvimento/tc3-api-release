import { IsEnum, IsUUID, validateOrReject } from "class-validator";
import { Column, Entity, ManyToOne, BeforeInsert, BeforeUpdate, JoinColumn, CreateDateColumn, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import Agreement from "./agreement";
import Message from "./message";
import {v4 as uuid} from "uuid";
import Team from "./team";
import Report from "./report";

export enum ChatStatus {
  active = "active", 
  in_agreement = "in_agreement", 
  banned = "banned",
  inactive = "inactive"
}

@Entity("chat")
export default class Chat {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID(4)
  id: string;

  @ManyToOne(() => Team, team => team.team1, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "team1_id" })
  team1: Team;

  @ManyToOne(() => Team, team => team.team2, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "team2_id" })
  team2: Team;

  @OneToMany(() => Agreement, agreement => agreement.chat, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  agreementChat: Agreement[];

  @OneToMany(() => Message, message => message.chat, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  message: Message[];

  @OneToMany(() => Report, report => report.chat, { onUpdate: "CASCADE", onDelete: "CASCADE" })
  reports: Report[];

  @Column({
    type: "enum",
    enum: ChatStatus,
    name: "status",
    default: ChatStatus.inactive
  })
  @IsEnum(ChatStatus, { message: "status must be one of these values: active, in_agreement, banned or inactive" })
  status: ChatStatus;

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