import { IsEnum, IsUUID, validateOrReject } from "class-validator";
import { Column, Entity, ManyToOne, BeforeInsert, BeforeUpdate, JoinColumn, PrimaryColumn, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";
import Chat from "./chat";
import Team from "./team";
import {v4 as uuid} from "uuid";

export enum AgreementStatus {
  pending = "pending", 
  rejected = "rejected", 
  cancelled = "cancelled",
  active = "active"
}

@Entity("agreement")
export default class Agreement {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID(4)
  id: string;

  @ManyToOne(() => Chat, chat => chat.agreementChat, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "chat_id" })
  chat: Chat;

  @ManyToOne(() => Team, team => team.agentAgreement, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "agent_id" })
  agent: Team;

  @Column({
    type: "enum",
    enum: AgreementStatus,
    name: "status"
  })

  @IsEnum(AgreementStatus, { message: "status must be one of these values: pending, rejected, cancelled,active" })
  status: AgreementStatus;

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