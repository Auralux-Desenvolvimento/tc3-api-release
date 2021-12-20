import { IsBoolean, validateOrReject } from "class-validator";
import { Column, Entity, ManyToOne, BeforeInsert, BeforeUpdate, JoinColumn, PrimaryColumn, CreateDateColumn } from "typeorm";
import Team from "./team";

@Entity("interest")
export default class Interest {
  
  @PrimaryColumn({ type: "varchar", name: "agent_id" })
  @ManyToOne(() => Team, team => team.agentInterest, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "agent_id" })
  agent: Team;

  @PrimaryColumn({ type: "varchar", name: "subject_id" })
  @ManyToOne(() => Team, team => team.subjectInterest, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "subject_id" })
  subject: Team;

  @Column("boolean", { name: "is_positive" })
  @IsBoolean({ message: "The interest state must be a boolean" })
  isPositive: boolean;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  readonly createdAt: Date;
  
  @BeforeInsert()
  @BeforeUpdate()
  async validate () {
    await validateOrReject(this);
  }
}