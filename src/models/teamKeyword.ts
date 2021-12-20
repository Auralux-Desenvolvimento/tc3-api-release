import {Entity, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";
import Keyword from "./keyword";
import Team from "./team";

@Entity("team_keyword")
export default class TeamKeyword {
  @PrimaryColumn({ type: "varchar", name: "team_id" })
  @ManyToOne(() => Team, team => team.teamKeywords, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "team_id" })
  team: Team;
  
  @PrimaryColumn({ type: "varchar", name: "keyword_id" })
  @ManyToOne(() => Keyword, keyword => keyword.teamKeyword, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "keyword_id" })
  keyword: Keyword;
}