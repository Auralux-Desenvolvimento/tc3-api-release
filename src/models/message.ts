import {IsBoolean, IsOptional, IsString, IsUUID, validateOrReject } from "class-validator";
import { Column, Entity, ManyToOne, BeforeInsert, BeforeUpdate, JoinColumn, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";
import Chat from "./chat";
import {v4 as uuid} from "uuid";
import Team from "./team";

@Entity("message")
export default class Message {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID(4)
  id: string;

  @ManyToOne(() => Chat, chat => chat.message, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "chat_id" })
  chat: Chat;

  @ManyToOne(() => Team, team => team.agentMessage, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "agent_id" })
  agent: Team;

  @ManyToOne(() => Team, team => team.subjectMessage, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "subject_id" })
  subject: Team;

  @Column("text")
  @IsString({ message: "A message content must be a string" })
  @IsOptional()
  content: string;
  
  @Column("boolean", { default: false })
  @IsBoolean({ message: "A message seen indicator must be a boolean" })
  @IsOptional()
  seen: boolean;

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