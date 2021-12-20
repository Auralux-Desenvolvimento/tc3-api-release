import { IsBoolean, IsOptional, IsString, IsUUID, validateOrReject } from "class-validator";
import { Column, Entity, BeforeInsert, BeforeUpdate, JoinColumn, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import {v4 as uuid} from "uuid";
import Chat from "./chat";
import Team from "./team";
import Moderator from './moderator';

@Entity("report")
export default class Report {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID(4)
  id: string;

  @ManyToOne(() => Team, team => team.reporterTeam, { onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "reporter_id" })
  reporterTeam: Team;

  @ManyToOne(() => Team, team => team.reportedTeam, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "reported_id" })
  reportedTeam: Team;

  @Column("text", { name: "message", nullable: false })
  @IsString({ message: "A message must be a string" })
  message: string;

  @ManyToOne(() => Chat, chat => chat.reports, { onDelete: "SET NULL", onUpdate: "CASCADE" })
  @IsOptional()
  @JoinColumn({ name: "chat_id" })
  chat?: Chat;

  @ManyToOne(() => Moderator, moderator => moderator.reports, { onDelete: "SET NULL", onUpdate: "CASCADE" })
  @IsOptional()
  @JoinColumn({ name: "moderator_id" })
  moderator?: Moderator;

  @Column("boolean", { name: "is_resolved", default: false })
  @IsBoolean({ message: "The report 'isResolved' state must be a boolean" })
  @IsOptional()
  isResolved: boolean;

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