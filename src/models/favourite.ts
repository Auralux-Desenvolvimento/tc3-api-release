import { validateOrReject } from "class-validator";
import { Entity, ManyToOne, BeforeInsert, BeforeUpdate, JoinColumn, PrimaryColumn, CreateDateColumn } from "typeorm";
import Team from "./team";

@Entity("favourite")
export default class Favourite {
  
  @PrimaryColumn({ type: "varchar", name: "agent_id" })
  @ManyToOne(() => Team, team => team.agentFavourite, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "agent_id" })
  agent: Team;

  @PrimaryColumn({ type: "varchar", name: "subject_id" })
  @ManyToOne(() => Team, team => team.subjectFavourite, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "subject_id" })
  subject: Team;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  readonly createdAt: Date;
  
  @BeforeInsert()
  @BeforeUpdate()
  async validate () {
    await validateOrReject(this);
  }
}